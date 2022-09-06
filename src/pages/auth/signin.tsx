import { GetServerSideProps } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { signIn, getCsrfToken, getProviders } from "next-auth/react";
import Image from "next/image";
import Header from "../../components/Header/Header";
import styles from "../../styles/Signin.module.css";

type SignInProps = {
  csrfToken: string;
  providers: { [key: string]: any };
};

const Signin = ({ csrfToken, providers }: SignInProps) => {
  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <div className={styles.wrapper} />
      <div className={styles.content}>
        <div className={styles.cardWrapper}>
          <Image
            src="/darknobgwmotto.png"
            width="150px"
            height="150px"
            alt="App Logo"
            style={{ height: "85px", marginBottom: "20px" }}
          />
          <div className={styles.cardContent}>
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <input placeholder="Email (Not Setup - Please use socials)" />
            <button className={styles.primaryBtn}>Login</button>
            <hr />
            {providers &&
              Object.values(providers).map(provider => (
                <div key={provider.name} className="mb-2">
                  <button
                    onClick={() =>
                      signIn(provider.id, {
                        callbackUrl: "/",
                      })
                    }
                  >
                    Sign in with {provider.name}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
      <img
        src="/login_pattern.svg"
        alt="Pattern Background"
        className={styles.styledPattern}
      />
    </div>
  );
};

export default Signin;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const providers = await getProviders();
  const csrfToken = await getCsrfToken(ctx);
  const session = await await getServerSession(ctx.req, ctx.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      providers,
      csrfToken,
    },
  };
};
