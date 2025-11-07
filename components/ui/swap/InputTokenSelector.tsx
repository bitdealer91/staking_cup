interface IInputTokenSelector {
  className?: string;
  inputTokenComponent: React.ReactNode;
  buttonSelectorComponent: React.ReactNode;
  walletBalanceComponent?: React.ReactNode;
  isInvalid?: boolean;
  readonly?: boolean;
}

const InputTokenSelector = ({
  className = '',
  inputTokenComponent,
  buttonSelectorComponent,
  walletBalanceComponent,
  isInvalid,
  readonly = false,
}: IInputTokenSelector) => {
  return (
    <div
      className={`
        bg-white rounded-lg p-3 
        border border-gray-200 
        transition-colors duration-150
        ${!readonly && 'hover:border-gray-900 focus-within:border-gray-900'}
        ${isInvalid ? 'border-red-500' : ''}
        ${!readonly && 'md:h-[108px]'}
        ${className}
      `}
    >
      <div className="flex justify-between items-center">
        {inputTokenComponent}
        {buttonSelectorComponent}
      </div>

      {walletBalanceComponent && (
        <div className="flex justify-end mt-4">{walletBalanceComponent}</div>
      )}
    </div>
  );
};

export default InputTokenSelector;
