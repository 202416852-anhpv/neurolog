interface GoogleIdConfig {
  client_id: string;
  callback: (response: { credential?: string }) => void;
  error_callback?: (error: { type?: string; message?: string }) => void;
}

interface GoogleRenderButtonOptions {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  shape?: "rectangular" | "pill";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  width?: number;
  locale?: string;
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfig) => void;
  renderButton: (parent: HTMLElement, options: GoogleRenderButtonOptions) => void;
}

interface GoogleNamespace {
  accounts?: {
    id?: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleNamespace;
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise: Promise<void> | null = null;

const loadGsiScript = (): Promise<void> => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${GSI_SRC}"]`,
      );
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Không tải được Google Sign-In")),
        );
        return;
      }
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Không tải được Google Sign-In"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

export const renderGoogleButton = async (
  container: HTMLElement,
  onSuccess: (credential: string) => void,
  onError: (message: string) => void,
): Promise<void> => {
  await loadGsiScript();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    onError("Thiếu cấu hình VITE_GOOGLE_CLIENT_ID");
    return;
  }
  const id = window.google?.accounts?.id;
  if (!id) {
    onError("Không khởi tạo được Google Sign-In");
    return;
  }
  id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError("Đăng nhập Google thất bại");
      }
    },
    error_callback: () => {
      onError("Đăng nhập Google bị huỷ hoặc gặp lỗi");
    },
  });
  id.renderButton(container, {
    theme: "outline",
    size: "large",
    shape: "rectangular",
    text: "continue_with",
    width: 300,
    locale: "vi",
  });
};
