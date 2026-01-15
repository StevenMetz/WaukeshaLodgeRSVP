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
  fields: {
    name: {
      label: string;
      placeholder: string;
      errorMessage: string;
    };
    email: {
      label: string;
      placeholder: string;
      errorMessageReq: string;
      errorMessageInvalid: string;
      errorMessageDuplicate: string;
      errorMessageSaveFail: string;
    };
    guests: {
      label: string;
      description: string;
      errorMessage: string;
    };
    notes: {
      label: string;
      placeholder: string;
      description: string;
      errorMessage: string;
      maxChars: number;
    };
  };
  ui: {
    submitButtonText: string;
    submitButtonLoadingText: string;
    successMessage: string;
  };
}

export const rsvpConfig: RSVPConfig = {
  event: {
    title: "Waukesha Lodge No. 37 – RSVP",
    subtitle: "Steak Dinner Event • $15 at the door",
    collectionName: "Steak-Dinner",
  },
  emailjs: {
    serviceId: "service_gzhuhu6",
    templateId: "template_hxzu6fl",
    publicKey: "g8SPOAXBmEcPAciCF",
  },
  fields: {
    name: {
      label: "Full Name *",
      placeholder: "Enter your full name",
      errorMessage: "Name is required",
    },
    email: {
      label: "Email Address *",
      placeholder: "Enter your email address",
      errorMessageReq: "Email is required",
      errorMessageInvalid: "Email is invalid",
      errorMessageDuplicate: "This email has already RSVP'd",
      errorMessageSaveFail: "Failed to save RSVP. Please try again.",
    },
    guests: {
      label: "Number of Guests",
      description: "Enter 0 if attending alone",
      errorMessage: "Number of guests cannot be negative",
    },
    notes: {
      label: "Special Notes (Optional)",
      placeholder: "Any special dietary requirements or notes...",
      description: "Optional: dietary restrictions, accessibility needs, etc.",
      errorMessage: "Notes cannot exceed 200 characters",
      maxChars: 200,
    },
  },
  ui: {
    submitButtonText: "Submit RSVP",
    submitButtonLoadingText: "Submitting...",
    successMessage: "Thank you for your RSVP! We look forward to seeing you.",
  },
};
