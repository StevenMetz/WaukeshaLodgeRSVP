export type InputType = 'text' | 'email' | 'number' | 'textarea';

export interface InputConfig {
  name: string;
  label: string;
  type: InputType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: string | number;
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    maxLength?: number;
    errorMessage?: string;
  };
}

export interface RSVPConfig {
  event: {
    title: string;
    subtitle: string;
    collectionName: string;
  };
  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
  inputs: InputConfig[];
  ui: {
    submitButtonText: string;
    submitButtonLoadingText: string;
    successMessage: string;
    errors: {
      duplicateEmail: string;
      saveFailed: string;
    };
  };
}

export const rsvpConfig: RSVPConfig = {
  event: {
    title: "Waukesha Lodge No. 37 – Feedback",
    subtitle: "Gate 0 of Parlor Plan",
    collectionName: "Feedback",
  },
  emailjs: {
    serviceId: "service_gzhuhu6",
    templateId: "template_hxzu6fl",
    publicKey: "g8SPOAXBmEcPAciCF",
  },
  inputs: [
    {
      name: "name",
      label: "Full Name *",
      type: "text",
      required: true,
      placeholder: "Enter your full name",
      defaultValue: "",
      validation: {
        maxLength: 200,
        errorMessage: "Name is required",
      },
    },
    {
      name: "email",
      label: "Email Address *",
      type: "email",
      required: true,
      placeholder: "Enter your email address",
      defaultValue: "",
      validation: {
        pattern: /\S+@\S+\.\S+/,
        maxLength: 200,
        errorMessage: "Valid email is required",
      },
    },
    {
      name: "feedback",
      label: "Feedback",
      type: "textarea",
      required: true,
      defaultValue: "",
      validation: {
        maxLength: 200,
        errorMessage: "Feedback is required",
      },
    },
  ],
  ui: {
    submitButtonText: "Confirm Feedback",
    submitButtonLoadingText: "Confirming...",
    successMessage: "Thank you for your feedback!",
    errors: {
      duplicateEmail: "This email has already been submitted.",
      saveFailed: "Failed to save feedback. Please try again.",
    },
  },
};
