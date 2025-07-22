import React, { useState } from 'react';
import TimePicker from 'react-time-picker';

function TimePickerComponent() {
  const [time, setTime] = useState('10:00');

  const onChange = (newTime) => {
    setTime(newTime);
  };

  return (
    <div>
      <h2>Selected Time: {time}</h2>
      <TimePicker
        onChange={onChange}
        value={time}
        disableClock={true} // Optional: if you want to disable the clock and use input only
      />
    </div>
  );
}

export default TimePickerComponent;
