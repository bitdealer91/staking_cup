interface ILoaderProps {
  loadingText?: string;
}

const Loader = ({ loadingText }: ILoaderProps) => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-20 h-20 bg-[url('/icons/loader.svg')] bg-no-repeat animate-spin"></div>
      {loadingText && <p className="mt-3">{loadingText}</p>}
    </div>
  );
};

export default Loader;
