import { useState } from 'react';
import { View } from 'react-native';

const ChatsLayout = () => {
  const [username, setUsername] = useState('');
  return (
    <View
      style={{
        flex: 1,
      }}
    ></View>
  );
};

export default ChatsLayout;
