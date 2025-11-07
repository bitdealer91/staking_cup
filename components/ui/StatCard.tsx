export default function StatCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      className='flex flex-col justify-center items-start 
        p-8 gap-4 flex-1 rounded-[32px]
        border-2 border-[#F8F8F8] bg-white'
    >
      <h1 className='text-[40px] font-bold leading-[1]'>{title}</h1>
      <p className='text-xl text-gray-500 leading-[1]'>{text}</p>
    </div>
  );
}
