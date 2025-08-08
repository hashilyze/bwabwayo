export default function Banner() {
  return (
    <div className="bg-black h-[250px] flex justify-center items-center relative overflow-hidden">
        <div className="flex absolute animate-slider">
          <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/adv-bar.png`} alt="전광판" className="w-auto h-10 object-cover" />
          <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/adv-bar.png`} alt="전광판" className="w-auto h-10 object-cover" />
          <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/adv-bar.png`} alt="전광판" className="w-auto h-10 object-cover" />
          <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/adv-bar.png`} alt="전광판" className="w-auto h-10 object-cover" />
          <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/adv-bar.png`} alt="전광판" className="w-auto h-10 object-cover" />
          <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/adv-bar.png`} alt="전광판" className="w-auto h-10 object-cover" />
          <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/adv-bar.png`} alt="전광판" className="w-auto h-10 object-cover" />
          <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/adv-bar.png`} alt="전광판" className="w-auto h-10 object-cover" />
        </div>
    </div>
  )
}