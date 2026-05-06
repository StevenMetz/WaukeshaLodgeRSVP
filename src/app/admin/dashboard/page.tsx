"use client";
import React, { useEffect, useState } from "react";
import { RSVPConfig, InputConfig, InputType } from "../../../config/rsvp-config";
import { fetchRsvpConfig, saveRsvpConfig } from "../../../lib/config-service";
import LodgeEmblem from "../../../components/LodgeEmblem";
import InputField from "../../../components/ui/InputField";
import SubmitButton from "../../../components/ui/SubmitButton";
import { auth } from "../../../../firebase";
import { signOut } from "firebase/auth";

export default function AdminDashboard() {
  const [config, setConfig] = useState<RSVPConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetchRsvpConfig().then((data) => {
      setConfig(data);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setIsSaving(true);
    setSaveMessage("");
    try {
      await saveRsvpConfig(config);
      setSaveMessage("Configuration saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save config:", error);
      setSaveMessage("Error saving configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const addInput = () => {
    if (!config) return;
    const newInput: InputConfig = {
      name: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
    };
    setConfig({ ...config, inputs: [...config.inputs, newInput] });
  };

  const removeInput = (index: number) => {
    if (!config) return;
    const updatedInputs = [...config.inputs];
    updatedInputs.splice(index, 1);
    setConfig({ ...config, inputs: updatedInputs });
  };

  const updateInput = (index: number, key: keyof InputConfig, value: string | number | boolean) => {
    if (!config) return;
    const updatedInputs = [...config.inputs];
    updatedInputs[index] = { ...updatedInputs[index], [key]: value };
    setConfig({ ...config, inputs: updatedInputs });
  };

  const updateValidationProperty = (index: number, key: keyof NonNullable<InputConfig["validation"]>, value: string | number) => {
    if (!config) return;
    const updatedInputs = [...config.inputs];
    const validation = updatedInputs[index].validation || {};
    updatedInputs[index] = { 
      ...updatedInputs[index], 
      validation: { ...validation, [key]: value } 
    };
    setConfig({ ...config, inputs: updatedInputs });
  };

  const updateNestedProperty = (section: keyof RSVPConfig, key: string, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      [section]: {
        ...(config[section] as Record<string, string>),
        [key]: value,
      },
    });
  };

  if (isLoading || !config) {
    return (
      <div className="flex justify-center items-center h-screen bg-lodge-gray-light">
        <LodgeEmblem size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lodge-gray-light p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-lodge-white shadow-xl rounded-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-lodge-navy py-4 px-6 flex justify-between items-center text-lodge-white">
          <div className="flex items-center gap-4">
            <LodgeEmblem size={40} className="filter brightness-0 invert" />
            <h1 className="text-2xl font-serif font-bold">Admin Dashboard</h1>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-sm border border-lodge-gold text-lodge-gold px-4 py-2 rounded transition-colors hover:bg-lodge-gold hover:text-lodge-navy"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-10">
          
          {/* Main Event Config */}
          <section className="bg-gray-50 p-6 rounded border border-gray-200">
            <h2 className="text-xl font-bold text-lodge-navy mb-4 border-b pb-2">Event Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Event Title"
                fieldId="eventTitle"
                value={config.event.title}
                onChange={(e) => updateNestedProperty("event", "title", e.target.value)}
              />
              <InputField
                label="Event Subtitle"
                fieldId="eventSubtitle"
                value={config.event.subtitle}
                onChange={(e) => updateNestedProperty("event", "subtitle", e.target.value)}
              />
              <InputField
                label="Firestore Collection Name"
                fieldId="collectionName"
                value={config.event.collectionName}
                onChange={(e) => updateNestedProperty("event", "collectionName", e.target.value)}
              />
            </div>
          </section>

          {/* EmailJS Config */}
          <section className="bg-gray-50 p-6 rounded border border-gray-200">
            <h2 className="text-xl font-bold text-lodge-navy mb-4 border-b pb-2">EmailJS Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Service ID"
                fieldId="emailServiceId"
                value={config.emailjs.serviceId}
                onChange={(e) => updateNestedProperty("emailjs", "serviceId", e.target.value)}
              />
              <InputField
                label="Template ID"
                fieldId="emailTemplateId"
                value={config.emailjs.templateId}
                onChange={(e) => updateNestedProperty("emailjs", "templateId", e.target.value)}
              />
              <InputField
                label="Public Key"
                fieldId="emailPublicKey"
                value={config.emailjs.publicKey}
                onChange={(e) => updateNestedProperty("emailjs", "publicKey", e.target.value)}
              />
            </div>
          </section>

          {/* UI Text Config */}
          <section className="bg-gray-50 p-6 rounded border border-gray-200">
            <h2 className="text-xl font-bold text-lodge-navy mb-4 border-b pb-2">UI Text Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Submit Button Text"
                fieldId="submitButtonText"
                value={config.ui.submitButtonText}
                onChange={(e) => updateNestedProperty("ui", "submitButtonText", e.target.value)}
              />
              <InputField
                label="Success Message"
                fieldId="successMessage"
                value={config.ui.successMessage}
                onChange={(e) => updateNestedProperty("ui", "successMessage", e.target.value)}
              />
            </div>
          </section>

          {/* Dynamic Fields */}
          <section className="bg-gray-50 p-6 rounded border border-gray-200">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-xl font-bold text-lodge-navy">Dynamic Form Fields</h2>
              <button
                type="button"
                onClick={addInput}
                className="bg-lodge-navy text-lodge-white px-4 py-2 rounded text-sm hover:bg-lodge-navy/90"
              >
                + Add Field
              </button>
            </div>
            
            <div className="space-y-6">
              {config.inputs.map((input, index) => (
                <div key={index} className="bg-white p-4 rounded border shadow-sm relative">
                  <button 
                    type="button"
                    onClick={() => removeInput(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-semibold"
                  >
                    Remove
                  </button>
                  <h3 className="font-semibold text-lodge-navy mb-3">Field {index + 1}: {input.label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InputField
                      label="Field Name (keys)"
                      fieldId={`name-${index}`}
                      value={input.name}
                      onChange={(e) => updateInput(index, "name", e.target.value)}
                    />
                    <InputField
                      label="Field Label"
                      fieldId={`label-${index}`}
                      value={input.label}
                      onChange={(e) => updateInput(index, "label", e.target.value)}
                    />
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium leading-6 text-lodge-navy mb-1" htmlFor={`type-${index}`}>
                        Input Type
                      </label>
                      <select
                        id={`type-${index}`}
                        value={input.type}
                        onChange={(e) => updateInput(index, "type", e.target.value as InputType)}
                        className="py-1.5 px-3 border border-gray-300 rounded focus:border-lodge-gold focus:outline-none"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="textarea">Textarea</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-7">
                      <input 
                        type="checkbox" 
                        id={`req-${index}`}
                        checked={input.required} 
                        onChange={(e) => updateInput(index, "required", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-lodge-navy focus:ring-lodge-gold"
                      />
                      <label htmlFor={`req-${index}`} className="text-sm font-medium text-lodge-navy">
                        Required Field
                      </label>
                    </div>
                  </div>
                  {/* Validation Settings */}
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InputField
                      label="Validation Pattern (Regex String)"
                      fieldId={`pattern-${index}`}
                      value={input.validation?.pattern || ""}
                      onChange={(e) => updateValidationProperty(index, "pattern", e.target.value)}
                    />
                    <InputField
                      label="Custom Error Message"
                      fieldId={`errMsg-${index}`}
                      value={input.validation?.errorMessage || ""}
                      onChange={(e) => updateValidationProperty(index, "errorMessage", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              {config.inputs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No fields added yet.</p>
              )}
            </div>
          </section>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <span className={`text-lodge-success font-medium transition-opacity ${saveMessage ? 'opacity-100' : 'opacity-0'}`}>
              {saveMessage}
            </span>
            <div className="w-1/3">
              <SubmitButton
                isLoading={isSaving}
                text="Save Configuration"
                loadingText="Saving..."
              />
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
