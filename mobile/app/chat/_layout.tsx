import { useEffect, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

// ws://127.0.0.1:3030/ws?username=PostmanUser2

const SERVER_URL = 'ws://10.106.1.136:3030';

const ChatsLayout = () => {
  const [username, setUsername] = useState('');
  const [usernameTemp, setUsernameTemp] = useState('');

  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    const websocket = new WebSocket(`${SERVER_URL}/ws?username=${username}`);

    websocket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    websocket.onmessage = (event) => {
      console.log('Message received:', event.data);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setWs(websocket);

    return () => {
      websocket.close();
      setWs(null);
      setUsername('');
    };
  }, [username]);

  if (!username) {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Please enter your username</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: 'gray',
            padding: 10,
            marginVertical: 10,
            width: '100%',
          }}
          placeholder="Enter your username"
          value={usernameTemp}
          onChangeText={setUsernameTemp}
        />
        <Button
          title="Submit"
          onPress={() => {
            if (usernameTemp.length < 3) {
              return;
            }
            setUsername(usernameTemp);
            setUsernameTemp('');
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    ></View>
  );
};

export default ChatsLayout;
