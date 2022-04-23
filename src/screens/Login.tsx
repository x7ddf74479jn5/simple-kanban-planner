import planImage from "../styles/plan.png";

type Props = {
  onLoginWithGoogle: () => void;
  onSignInAnon: () => void;
};

export const Login = ({ onLoginWithGoogle: handleLoginWithGoogle, onSignInAnon: handleSignInAnon }: Props) => {
  return (
    <>
      <div className="flex flex-col-reverse py-12 px-5 h-screen bg-gradient-to-r from-indigo-50 via-blue-50 to-red-50 md:flex-row md:justify-between md:py-24 md:px-20">
        <div className="pt-4 w-full md:pr-12 md:w-7/12">
          <h1 className="text-3xl text-primary md:text-5xl">Simple Kanban Plannerをはじめましょう。</h1>
          <p className="mt-3 text-base leading-normal text-gray-600 md:mt-6 md:text-xl">
            Simple Kanban Plannerはあなた個人の生活や目標、その他いろいろなことを管理する手助けにうってつけです。
          </p>
          <div className="flex mt-6 text-sm md:mt-16 md:text-base">
            <button
              className="py-1  px-2 mr-4 text-gray-100 bg-blue-800 rounded-sm transition-transform duration-300 hover:-translate-y-1"
              onClick={handleLoginWithGoogle}
            >
              Googleアカウントログイン
            </button>
            <button
              className="py-1 px-2  text-gray-800 rounded-sm border border-black transition-transform duration-300 hover:-translate-y-1"
              onClick={handleSignInAnon}
            >
              ゲストとして利用 <sup>*</sup>
            </button>
          </div>
          <p className="mt-6 text-xs text-gray-600">
            <sup>*</sup>ログアウトしたらデータが消えます。
          </p>
        </div>
        <div className="w-full md:w-5/12">
          <img src={planImage} alt="plan" />
        </div>
      </div>
    </>
  );
};
