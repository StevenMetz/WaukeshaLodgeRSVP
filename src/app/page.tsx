"use client";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import db from "../../firebase";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import LodgeEmblem from "../components/LodgeEmblem";
import { rsvpConfig, InputConfig } from "../config/rsvp-config";
import InputField from "../components/ui/InputField";
import TextAreaField from "../components/ui/TextAreaField";
import SubmitButton from "../components/ui/SubmitButton";

interface FormValues {
  [key: string]: string | number;
}

interface FormErrors {
  [key: string]: string;
}

export default function Home() {
  // Initialize state based on config
  const initialValues: FormValues = rsvpConfig.inputs.reduce((acc, input) => {
    acc[input.name] = input.defaultValue ?? "";
    return acc;
  }, {} as FormValues);

  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useRef<HTMLFormElement>(null);
  const { event, emailjs: emailConfig, inputs, ui } = rsvpConfig;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    inputs.forEach((input) => {
      const value = formValues[input.name];
      
      // Required check
      if (input.required && (value === "" || value === undefined || value === null)) {
        newErrors[input.name] = input.validation?.errorMessage || `${input.label} is required`;
      }
      
      // Pattern check (Regex)
      if (input.validation?.pattern && typeof value === 'string' && value && !input.validation.pattern.test(value)) {
        newErrors[input.name] = input.validation.errorMessage || "Invalid format";
      }
      
      // Number checks
      if (input.type === 'number' && typeof value === 'number') {
        if (input.validation?.min !== undefined && value < input.validation.min) {
           newErrors[input.name] = input.validation.errorMessage || `Value must be at least ${input.validation.min}`;
        }
        if (input.validation?.max !== undefined && value > input.validation.max) {
           newErrors[input.name] = input.validation.errorMessage || `Value must be at most ${input.validation.max}`;
        }
      }
      
      // Length check
      if (input.validation?.maxLength && typeof value === 'string' && value.length > input.validation.maxLength) {
         newErrors[input.name] = input.validation.errorMessage || `Max length is ${input.validation.maxLength}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string | number) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (input: InputConfig) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value: string | number = e.target.value;
    
    if (input.type === 'number') {
        const num = parseInt(value);
        value = isNaN(num) ? 0 : num;
        if (input.validation?.min !== undefined) {
             value = Math.max(input.validation.min, value);
        }
    } else if (input.validation?.maxLength) {
        if (value.length > input.validation.maxLength) return;
    }

    handleChange(input.name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Specific logic for email duplication check - assumes 'email' field exists
      if (formValues.email) {
          const email = formValues.email as string;
          const q = query(collection(db, event.collectionName), where("lowercaseEmail", "==", email.toLowerCase()));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            setErrors(prev => ({ ...prev, email: ui.errors.duplicateEmail }));
            return;
          }
      }

      const rsvpData = {
        ...formValues,
        lowercaseEmail: typeof formValues.email === 'string' ? formValues.email.toLowerCase() : formValues.email,
        timestamp: new Date(),
      };

      await addDoc(collection(db, event.collectionName), rsvpData);

      if (form.current) {
        // Prepare data for EmailJS - mapping keys if necessary, or assuming template uses same keys
        const templateParams = {
            to_name: formValues.name, // Mapping config 'name' to template 'to_name' if needed
            to_email: formValues.email,
            ...formValues
        };

        await emailjs.send(
          emailConfig.serviceId,
          emailConfig.templateId,
          templateParams,
          emailConfig.publicKey
        );
      }

      setSuccessMessage(true);
      setFormValues(initialValues); // Reset form
      form.current?.reset();
    } catch (error) {
      console.error("Error saving RSVP: ", error);
       // Attempt to set error on email field if it exists, otherwise general console error
       if (inputs.find(i => i.name === 'email')) {
           setErrors(prev => ({ ...prev, email: ui.errors.saveFailed }));
       }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-lodge-gray-light flex items-center justify-center min-h-screen p-4">
      <div className="bg-lodge-white p-7 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header Section */}
        <div className="text-center mb-7">
          {/* Square & Compasses Emblem and Title */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <LodgeEmblem size={70} />
            <div className="text-left">
              <h1 className="text-2xl font-serif font-bold text-lodge-navy">{event.title}</h1>
              <p className="text-base text-lodge-navy">{event.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Gold Divider */}
        <div className="w-full h-1 bg-lodge-gold mb-7"></div>

        {/* RSVP Form */}
        <form ref={form} onSubmit={handleSubmit} className="space-y-5" aria-label="RSVP Form" role="form">
          
          {inputs.map((input) => {
            if (input.type === 'textarea') {
              return (
                <TextAreaField
                  key={input.name}
                  label={input.label}
                  placeholder={input.placeholder}
                  name={input.name}
                  fieldId={input.name}
                  value={formValues[input.name] as string}
                  onChange={handleInputChange(input)}
                  disabled={isLoading}
                  maxLength={input.validation?.maxLength}
                  rows={3}
                  error={errors[input.name]}
                  description={input.description}
                  aria-required={input.required}
                />
              );
            }

            return (
              <InputField
                key={input.name}
                label={input.label}
                placeholder={input.placeholder}
                type={input.type}
                name={input.name} // Important for EmailJS if it uses form ref
                fieldId={input.name}
                value={formValues[input.name] as string | number}
                onChange={handleInputChange(input)}
                disabled={isLoading}
                maxLength={input.validation?.maxLength}
                min={input.validation?.min}
                error={errors[input.name]}
                description={input.description}
                aria-required={input.required}
              />
            );
          })}

          <SubmitButton
            isLoading={isLoading}
            text={ui.submitButtonText}
            loadingText={ui.submitButtonLoadingText}
          />
        </form>

        {/* Success Message */}
        {successMessage && (
          <div
            className="mt-4 p-3 bg-lodge-success/10 border border-lodge-success rounded-lg"
            role="alert"
            aria-live="polite"
          >
            <p className="text-lodge-success text-center font-sans font-semibold">
              {ui.successMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
