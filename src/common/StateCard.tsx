export interface StateCardProps {
  icon: React.ReactNode;
  stateName: string;
  rate: number | string;
  state: string;
  color?: string; 
  textColor?: string; 
}

export const StateCard = ({ 
  icon, 
  stateName, 
  rate, 
  state, 
  color = 'bg-blue-100',
  textColor = 'text-gray-800' 
}: StateCardProps) => {
  return (
    <div className={`max-w-[268px] w-full h-[242px] ${color} rounded-[20px] flex flex-col items-start justify-between p-6 shadow-lg`}>
      <div className={textColor}>
        {icon}
        <h3 className="text-[16px] font-normal text-black">{stateName}</h3>
        <p className="text-[30px] text-black font-extrabold">{rate}</p>
        <p className="text-[14px] text-black font-normal">{state}</p>
      </div>
    </div>
  )
}