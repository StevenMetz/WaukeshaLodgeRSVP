"use client";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import db from "../../firebase";
import { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

interface FoodItem {
  id: number;
  title: string;
  type: "text" | "checkbox" | "number";
  value: string | number | boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
}

export default function Home() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { id: 1, title: "Side Dish", type: "text", value: "" },
    { id: 2, title: "Bread & Rolls", type: "checkbox", value: false },
    { id: 3, title: "Ham Alternative", type: "text", value: "" },
  ]);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [guests, setGuests] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [breadAndRollsAvailable, setBreadAndRollsAvailable] = useState<boolean>(true);
  const form = useRef<HTMLFormElement>(null);
  const maxChars = 200;

  const foodItemsForEmail = () => {
    const foodItemsObject: { [key: string]: string } = {};

    foodItems.forEach((item) => {
      if (item.title === "Bread & Rolls" && !breadAndRollsAvailable) {
        return;
      }

      if (item.type === "checkbox" && item.value === true) {
        foodItemsObject[item.title] = "Yes";
      } else if (item.type === "text" && item.value) {
        foodItemsObject[item.title] = item.value as string;
      }
    });

    // Convert object to "Key: value" string format, each on a new line
    return Object.entries(foodItemsObject)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };

  // Check if Bread & Rolls is already being brought by someone else
  useEffect(() => {
    const checkBreadAndRolls = async () => {
      try {
        const q = query(
          collection(db, "Family-Dinner-Night"),
          where("foodItems", "array-contains", { id: 2, title: "Bread & Rolls", type: "checkbox", value: true })
        );
        const querySnapshot = await getDocs(q);
        setBreadAndRollsAvailable(querySnapshot.empty);
      } catch (error) {
        console.error("Error checking Bread & Rolls:", error);
      }
    };

    checkBreadAndRolls();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFoodItemChange = (id: number, value: string | boolean) => {
    // If Bread & Rolls, check availability
    if (id === 2 && value === true && !breadAndRollsAvailable) {
      return;
    }

    setFoodItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (typeof value === "string" && value.length > maxChars) {
            return item; // Don't update if over limit
          }
          return { ...item, value };
        }
        return item;
      })
    );
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

    // If Bread & Rolls is checked, verify it's still available
    const breadAndRollsItem = foodItems.find((item) => item.id === 2);
    if (breadAndRollsItem?.value === true) {
      const q = query(
        collection(db, "Family-Dinner-Night"),
        where("foodItems", "array-contains", { id: 2, title: "Bread & Rolls", type: "checkbox", value: true })
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setErrors({ email: "Bread & Rolls is no longer available" });
        return;
      }
    }

    setIsLoading(true);
    try {
      // Check for existing email
      const q = query(collection(db, "Family-Dinner-Night"), where("lowercaseEmail", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setErrors({ email: "This email has already RSVP'd" });
        return;
      }

      const rsvpData = {
        name,
        email,
        lowercaseEmail: email.toLowerCase(),
        foodItems,
        guests,
        timestamp: new Date(),
      };

      await addDoc(collection(db, "Family-Dinner-Night"), rsvpData);

      if (form.current) {
        await emailjs.send(
          "service_gzhuhu6",
          "template_hxzu6fl",
          {
            to_email: email,
            to_name: name,
            guests: guests,
            food_items: foodItemsForEmail(),
          },
          "g8SPOAXBmEcPAciCF"
        );
      }

      setSuccessMessage(true);
      setName("");
      setEmail("");
      setGuests(0);
      setFoodItems((prev) => prev.map((item) => ({ ...item, value: item.type === "checkbox" ? false : "" })));
      form.current?.reset();
    } catch (error) {
      console.error("Error saving RSVP: ", error);
      setErrors({ email: "Failed to save RSVP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Family Dinner and Game Night RSVP</h1>
        <p className="text-gray-700 text-lg pb-1">When: March 15th @ 6:30pm</p>
        <p className="text-gray-700 text-lg pb-5">Where: 317 South Street Waukesha, WI 53186</p>

        <form ref={form} onSubmit={handleSubmit} className="space-y-4" aria-label="RSVP Form" role="form">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              name="to_name"
              id="name"
              value={name}
              onChange={handleTextChange(setName)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:opacity-50"
              placeholder="Your Name"
              disabled={isLoading}
              maxLength={maxChars}
              aria-required="true"
              aria-label="Enter your name"
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="to_email"
              value={email}
              onChange={handleTextChange(setEmail)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:opacity-50"
              placeholder="Your Email"
              disabled={isLoading}
              maxLength={maxChars}
              aria-required="true"
              aria-label="Enter your email address"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="guests" className="block text-gray-700 font-medium mb-2">
              Number of Guests
            </label>
            <input
              type="number"
              id="guests"
              name="guests"
              value={guests}
              onChange={(e) => setGuests(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:opacity-50"
              min="0"
              disabled={isLoading}
              aria-label="Enter number of guests"
              aria-describedby="guests-description"
            />
            <span id="guests-description" className="text-gray-500 text-sm">
              Enter 0 if attending alone
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-gray-700 font-medium" id="food-contributions">
              Food Contributions
            </h3>
            <div role="group" className="flex flex-col gap-3" aria-labelledby="food-contributions">
              {foodItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <label htmlFor={item.title} className="text-gray-700">
                    {item.title}
                    {item.id === 2 && !breadAndRollsAvailable && (
                      <span className="text-red-500 ml-2 text-sm">(Already Claimed)</span>
                    )}
                  </label>
                  {item.type === "checkbox" ? (
                    <input
                      id={item.title}
                      type="checkbox"
                      name={item.title}
                      checked={item.value as boolean}
                      onChange={(e) => handleFoodItemChange(item.id, e.target.checked)}
                      disabled={isLoading || (item.id === 2 && !breadAndRollsAvailable)}
                      aria-label={`Bring ${item.title}`}
                    />
                  ) : (
                    <input
                      id={item.title}
                      name={item.title}
                      type="text"
                      value={item.value as string}
                      onChange={(e) => handleFoodItemChange(item.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-black disabled:opacity-50"
                      disabled={isLoading}
                      maxLength={maxChars}
                      aria-label={`Specify ${item.title}`}
                      placeholder={`Enter ${item.title.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label={isLoading ? "Submitting RSVP" : "Confirm RSVP"}
          >
            {isLoading ? "Submitting..." : "Confirm RSVP"}
          </button>
        </form>

        {successMessage && (
          <p className="text-green-500 mt-4 text-center" role="alert" aria-live="polite">
            Thank you for your RSVP! See you at the event!
          </p>
        )}
      </div>
    </div>
  );
}
