"use client";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import db from "../../firebase";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import LodgeEmblem from "../components/LodgeEmblem";

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
  const maxChars = 200;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (guests < 0) newErrors.guests = "Number of guests cannot be negative";
    if (notes.length > maxChars) newErrors.notes = `Notes cannot exceed ${maxChars} characters`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setter(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Check for existing email
      const q = query(collection(db, "Steak-Dinner"), where("lowercaseEmail", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setErrors({ email: "This email has already RSVP'd" });
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

      await addDoc(collection(db, "Steak-Dinner"), rsvpData);

      if (form.current) {
        await emailjs.send(
          "service_gzhuhu6",
          "template_hxzu6fl",
          {
            to_email: email,
            to_name: name,
            guests: guests,
            notes: notes,
          },
          "g8SPOAXBmEcPAciCF"
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
      setErrors({ email: "Failed to save RSVP. Please try again." });
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
              <h1 className="text-2xl font-serif font-bold text-lodge-navy">Waukesha Lodge No. 37 – RSVP</h1>
              <p className="text-base text-lodge-navy">Steak Dinner Event • $15 at the door</p>
            </div>
          </div>
        </div>

        {/* Gold Divider */}
        <div className="w-full h-1 bg-lodge-gold mb-7"></div>

        {/* RSVP Form */}
        <form ref={form} onSubmit={handleSubmit} className="space-y-5" aria-label="RSVP Form" role="form">
          {/* Full Name Field */}
          <div>
            <label htmlFor="name" className="block text-lodge-navy font-sans font-semibold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="to_name"
              id="name"
              value={name}
              onChange={handleTextChange(setName)}
              className={`w-full border-2 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-lodge-gold text-lodge-navy disabled:opacity-50 font-sans ${
                errors.name ? "border-lodge-error" : "border-lodge-gray-border"
              }`}
              placeholder="Enter your full name"
              disabled={isLoading}
              maxLength={maxChars}
              aria-required="true"
              aria-label="Enter your full name"
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-lodge-error text-sm mt-1.5 font-sans" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-lodge-navy font-sans font-semibold mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="to_email"
              value={email}
              onChange={handleTextChange(setEmail)}
              className={`w-full border-2 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-lodge-gold text-lodge-navy disabled:opacity-50 font-sans ${
                errors.email ? "border-lodge-error" : "border-lodge-gray-border"
              }`}
              placeholder="Enter your email address"
              disabled={isLoading}
              maxLength={maxChars}
              aria-required="true"
              aria-label="Enter your email address"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-lodge-error text-sm mt-1.5 font-sans" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Number of Guests Field */}
          <div>
            <label htmlFor="guests" className="block text-lodge-navy font-sans font-semibold mb-2">
              Number of Guests
            </label>
            <input
              type="number"
              id="guests"
              name="guests"
              value={guests}
              onChange={(e) => setGuests(Math.max(0, parseInt(e.target.value) || 0))}
              className={`w-full border-2 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-lodge-gold text-lodge-navy disabled:opacity-50 font-sans ${
                errors.guests ? "border-lodge-error" : "border-lodge-gray-border"
              }`}
              min="0"
              disabled={isLoading}
              aria-label="Enter number of guests"
              aria-describedby="guests-description"
            />
            <span id="guests-description" className="text-lodge-navy text-sm font-sans">
              Enter 0 if attending alone
            </span>
            {errors.guests && (
              <p className="text-lodge-error text-sm mt-1.5 font-sans" role="alert">
                {errors.guests}
              </p>
            )}
          </div>

          {/* Special Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-lodge-navy font-sans font-semibold mb-2">
              Special Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full border-2 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-lodge-gold text-lodge-navy disabled:opacity-50 font-sans resize-none ${
                errors.notes ? "border-lodge-error" : "border-lodge-gray-border"
              }`}
              placeholder="Any special dietary requirements or notes..."
              disabled={isLoading}
              maxLength={maxChars}
              rows={3}
              aria-label="Enter any special notes or requirements"
              aria-describedby={errors.notes ? "notes-error" : "notes-description"}
            />
            <span id="notes-description" className="text-lodge-navy text-sm font-sans">
              Optional: dietary restrictions, accessibility needs, etc.
            </span>
            {errors.notes && (
              <p id="notes-error" className="text-lodge-error text-sm mt-1.5 font-sans" role="alert">
                {errors.notes}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-lodge-gold text-lodge-navy py-3.5 rounded-lg hover:bg-yellow-500 active:bg-yellow-600 transition-all duration-200 disabled:bg-lodge-gray-border disabled:cursor-not-allowed font-sans font-semibold text-lg shadow-lg hover:shadow-xl"
            disabled={isLoading}
            aria-label={isLoading ? "Submitting RSVP" : "Submit RSVP"}
          >
            {isLoading ? "Submitting..." : "Submit RSVP"}
          </button>
        </form>

        {/* Success Message */}
        {successMessage && (
          <div
            className="mt-4 p-3 bg-lodge-success/10 border border-lodge-success rounded-lg"
            role="alert"
            aria-live="polite"
          >
            <p className="text-lodge-success text-center font-sans font-semibold">
              Thank you for your RSVP! We look forward to seeing you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
