import clsx from 'clsx';

export const Title = () => {
  return (
    <div className='flex flex-col items-center gap-4 w-full'>
      <h1 className='text-[40px] leading-10 font-polysans font-semibold text-center tracking-[0.80px]'>
        Validators
      </h1>
      <p
        className={clsx(
          'text-lg text-center font-polysans pb-6 leading-none',
          `text-[#777]`
        )}
      >
        Discover our partner validators
      </p>
    </div>
  );
};
