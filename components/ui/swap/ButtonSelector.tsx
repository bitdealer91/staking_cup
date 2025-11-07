// import Icon from '../components/Icon';
// import IconToken from '../components/IconToken';

interface IButtonSelectorProps {
  selectorText: string;
  type?: 'background' | 'border' | 'default';
  className?: string;
  selectedToken?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface ITypeMapping {
  [key: string]: string;
}

const typeMapping: ITypeMapping = {
  default: '',
  background: 'with-background',
  border: 'with-border',
};

const ButtonSelector = ({
  selectorText,
  type = 'default',
  className,
  onClick,
  selectedToken,
  disabled = false,
}: IButtonSelectorProps) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const baseClasses = "flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer";
  const typeClasses = {
    default: "border border-white",
    background: "bg-gray-800",
    border: "border-2 border-white"
  };
  
  return (
    <div
      onClick={handleClick}
      className={`
        ${baseClasses}
        ${typeClasses[type]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}
        ${className || ''}
      `}
    >
      {selectedToken ? (
        <span className="text-base text-gray-800">{selectedToken}</span>
      ) : (
        <span className="text-sm text-gray-400">{selectorText}</span>
      )}
    </div>
  );
};

export default ButtonSelector;
