"use client";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import db from "../../firebase";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
export default function Home() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const form = useRef<HTMLFormElement | null>(null);
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      // Check if the email already exists
      const q = query(collection(db, "ThirstyDuck"), where("lowercaseEmail", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("This email has already RSVP'd.");
        return;
      }

      // Add RSVP to Firestore
      await addDoc(collection(db, "ThirstyDuck"), {
        name: name,
        email: email,
        lowercaseEmail: email.toLowerCase(),
        timestamp: new Date(),
      });

      setSuccessMessage(true);
      setName("");
      setEmail("");
      setDisabled(true);
      if (form.current) {
        emailjs
          .sendForm("service_gzhuhu6", "template_hxzu6fl", form.current, "g8SPOAXBmEcPAciCF")
          .then((result) => {
            console.log(result.text);
            console.log(result);
          })
          .catch((error) => {
            console.error(error.text);
          });
      }
    } catch (error) {
      console.error("Error saving RSVP: ", error);
      alert("Failed to save your RSVP. Please try again.");
    } finally {
      setTimeout(() => {
        setDisabled(false);
      }, 1000);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Thirsty Duck Bowling RSVP</h1>

        <p className="text-black text-l pb-1">When: January 18th @ 6:00pm</p>
        <p className="text-black text-l pb-5">Where: 64W23180 Main St. Sussex , WI 53089 </p>
        <form ref={form} onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              name="to_name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Your Name"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="to_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Your Email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            disabled={disabled}
          >
            Submit
          </button>
        </form>
        {successMessage && <p className="text-green-500 mt-4">Thank you for your RSVP!</p>}
      </div>
    </div>
  );
}
