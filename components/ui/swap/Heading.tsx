import clsx from 'clsx';

interface IHeadingProps {
  size: 'large' | 'medium' | 'small';
  title: string;
  className?: string;
}

const Heading = ({ size, title, className }: IHeadingProps) => {
  return (
    <div className={className}>
      <h2 className={clsx(`heading-${size}`)}>{title}</h2>
      <hr className='mt-3 mb-6' />
    </div>
  );
};

export default Heading;
