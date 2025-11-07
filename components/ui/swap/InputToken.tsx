type IInputTokenProps = {
  isCompact?: boolean;
  className?: string;
  placeholder?: string;
} & React.ComponentPropsWithoutRef<'input'>;

const InputToken = (props: IInputTokenProps) => {
  const { className = '', placeholder, isCompact } = props;
  const { ...jsxProps } = props;

  return (
    <input
      autoComplete="off"
      placeholder={placeholder ? placeholder : '0.0'}
      className={`
        w-full bg-white text-gray-900 border-none outline-none
        ${isCompact ? 'text-base md:text-xl max-w-[230px] md:max-w-[270px]' : 'text-xl md:text-2xl max-w-[150px] md:max-w-[290px]'}
        flex-[0_1_auto]
        ${className}
      `}
      type="text"
      {...jsxProps}
    />
  );
};

export default InputToken;
