type GoogleCredentialResponse = { credential: string };

interface Window {
  google?: {
    accounts: {
      id: {
        initialize(config: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }): void;
        renderButton(
          parent: HTMLElement,
          options: {
            type: "standard";
            theme: "outline";
            size: "large";
            text: "signin_with";
            shape: "pill";
            width?: number;
          },
        ): void;
      };
    };
  };
}
