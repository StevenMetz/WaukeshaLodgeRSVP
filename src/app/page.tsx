"use client";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import db from "../../firebase";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import LodgeEmblem from "../components/LodgeEmblem";
import { rsvpConfig } from "../config/rsvp-config";
import InputField from "../components/ui/InputField";
import TextAreaField from "../components/ui/TextAreaField";
import SubmitButton from "../components/ui/SubmitButton";

interface FormErrors {
  name?: string;
  email?: string;
  guests?: string;
  notes?: string;
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [guests, setGuests] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useRef<HTMLFormElement>(null);
  const { event, emailjs: emailConfig, fields, ui } = rsvpConfig;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = fields.name.errorMessage;
    if (!email.trim()) {
      newErrors.email = fields.email.errorMessageReq;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = fields.email.errorMessageInvalid;
    }
    if (guests < 0) newErrors.guests = fields.guests.errorMessage;
    if (notes.length > fields.notes.maxChars) newErrors.notes = fields.notes.errorMessage;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextChange = (setter: (value: string) => void, maxChars?: number) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (!maxChars || value.length <= maxChars) {
      setter(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Check for existing email
      const q = query(collection(db, event.collectionName), where("lowercaseEmail", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setErrors({ email: fields.email.errorMessageDuplicate });
        return;
      }

      const rsvpData = {
        name,
        email,
        lowercaseEmail: email.toLowerCase(),
        guests,
        notes,
        timestamp: new Date(),
      };

      await addDoc(collection(db, event.collectionName), rsvpData);

      if (form.current) {
        await emailjs.send(
          emailConfig.serviceId,
          emailConfig.templateId,
          {
            to_email: email,
            to_name: name,
            guests: guests,
            notes: notes,
          },
          emailConfig.publicKey
        );
      }

      setSuccessMessage(true);
      setName("");
      setEmail("");
      setGuests(0);
      setNotes("");
      form.current?.reset();
    } catch (error) {
      console.error("Error saving RSVP: ", error);
      setErrors({ email: fields.email.errorMessageSaveFail });
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
          <InputField
            label={fields.name.label}
            placeholder={fields.name.placeholder}
            type="text"
            name="to_name"
            fieldId="name"
            value={name}
            onChange={handleTextChange(setName, 200)}
            disabled={isLoading}
            maxLength={200}
            error={errors.name}
            aria-required="true"
            aria-label={fields.name.placeholder}
          />

          <InputField
            label={fields.email.label}
            placeholder={fields.email.placeholder}
            type="email"
            name="to_email"
            fieldId="email"
            value={email}
            onChange={handleTextChange(setEmail, 200)}
            disabled={isLoading}
            maxLength={200}
            error={errors.email}
            aria-required="true"
            aria-label={fields.email.placeholder}
          />

          <InputField
            label={fields.guests.label}
            type="number"
            name="guests"
            fieldId="guests"
            value={guests}
            onChange={(e) => setGuests(Math.max(0, parseInt(e.target.value) || 0))}
            disabled={isLoading}
            min={0}
            error={errors.guests}
            description={fields.guests.description}
            aria-label="Enter number of guests"
          />

          <TextAreaField
            label={fields.notes.label}
            placeholder={fields.notes.placeholder}
            name="notes"
            fieldId="notes"
            value={notes}
            onChange={handleTextChange(setNotes, fields.notes.maxChars)}
            disabled={isLoading}
            maxLength={fields.notes.maxChars}
            rows={3}
            error={errors.notes}
            description={fields.notes.description}
            aria-label={fields.notes.placeholder}
          />

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
