import React, { useState } from 'react';
import TimePicker from 'react-time-picker';

function TimePickerComponent() {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));

  const onChange = (newTime) => {
    setTime(newTime);
  };

  return (
    <div>
      <h2>Selected Time: {time}</h2>
      <TimePicker
        onChange={onChange}
        value={time}
        inputVisible={true}
      />
    </div>
  );
}

export default TimePickerComponent;
