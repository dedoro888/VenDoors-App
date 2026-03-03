const data = [
  { day: "Mon", orders: 4, height: 40 },
  { day: "Tue", orders: 7, height: 70 },
  { day: "Wed", orders: 2, height: 20 },
  { day: "Thu", orders: 0, height: 4 },
  { day: "Fri", orders: 5, height: 50 },
  { day: "Sat", orders: 8, height: 80 },
  { day: "Sun", orders: 3, height: 30 },
];

const WeeklyChart = () => {
  return (
    <div className="flex items-end justify-between gap-2 px-2">
      {data.map((item) => (
        <div key={item.day} className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">{item.day}</span>
          <div className="flex h-20 w-7 items-end overflow-hidden rounded-t-md bg-muted">
            <div
              className="w-full rounded-t-md bg-primary transition-all duration-500"
              style={{ height: `${item.height}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-foreground">{item.orders}</span>
        </div>
      ))}
    </div>
  );
};

export default WeeklyChart;
