import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, isAllowedEmail, signIn } from "@/auth";
import "./login.css";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  AccessDenied: "Esta cuenta no tiene acceso. Utiliza tu correo corporativo.",
  OAuthSignin: "No se pudo iniciar el acceso con Google. Inténtalo de nuevo.",
  OAuthCallback: "Google no pudo completar el acceso. Inténtalo de nuevo.",
  Configuration: "El acceso con Google todavía no está configurado.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (isAllowedEmail(session?.user?.email)) {
    redirect("/");
  }

  const { error } = await searchParams;
  const errorMessage = error
    ? errorMessages[error] ?? "No se pudo iniciar sesión. Inténtalo de nuevo."
    : null;

  return (
    <main className="loginPage">
      <div className="loginGlow loginGlowOne" />
      <div className="loginGlow loginGlowTwo" />

      <section className="loginCard" aria-labelledby="login-title">
        <div className="loginBrand">
          <Image
            src="/brand.png"
            alt="La Ola Buena"
            width={230}
            height={74}
            priority
          />
        </div>

        <div className="loginCopy">
          <span className="loginEyebrow">Espacio de trabajo</span>
          <h1 id="login-title">Bienvenido de vuelta</h1>
          <p>
            Accede al generador de contratos con tu cuenta corporativa de
            La Ola Buena.
          </p>
        </div>

        {errorMessage && (
          <div className="loginError" role="alert">
            <span aria-hidden="true">!</span>
            <p>{errorMessage}</p>
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button className="googleButton" type="submit">
            <GoogleIcon />
            <span>Continuar con Google</span>
          </button>
        </form>

        <div className="domainNotice">
          <span className="domainIcon" aria-hidden="true">
            <LockIcon />
          </span>
          <p>
            Acceso exclusivo para cuentas
            <strong>@laolabuena.com</strong>
          </p>
        </div>

        <p className="loginFooter">
          Tus credenciales se gestionan de forma segura a través de Google.
        </p>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.25-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.63.39 3.18 1.04 4.53l3.35-2.61Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 10V7.75a4.5 4.5 0 0 1 9 0V10M6.5 10h11a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 14v2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
