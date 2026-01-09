import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MessageResponse } from '../../interfaces/MessageResponse';
import { generateUsername } from 'unique-username-generator';
import InputReply from '../../components/ui/InputReply';
import { SafeAreaView } from 'react-native-safe-area-context';

// ws://127.0.0.1:3030/ws?username=PostmanUser2

const SERVER_URL = 'ws://10.164.186.97:3030';

const Chats = () => {
  const [username, setUsername] = useState(generateUsername('-'));

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);

  useEffect(() => {
    if (!username) {
      return;
    }

    const websocket = new WebSocket(`${SERVER_URL}/ws?username=${username}`);

    websocket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    websocket.onmessage = (event) => {
      const message = event.data;

      const formatted = JSON.parse(message) as MessageResponse;
      setMessages((prev) => [...prev, formatted]);
      console.log('Message received:', {
        message,
        type: typeof message,
      });
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

  const RenderItem = ({ item }: { item: MessageResponse }) => {
    const isMe = item.sender === username;
    const isSystem = item.sender === 'System';
    return (
      <View
        style={[
          styles.itemChat,
          {
            backgroundColor: isSystem ? '#fdf0d5' : 'white',
            alignSelf: isSystem ? 'center' : isMe ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        {!isSystem && <Text style={styles.itemSender}>{item.sender}</Text>}
        <Text>{item.message}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={RenderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
      <InputReply
        onSend={(text) => {
          ws?.send(text);
        }}
      />
    </SafeAreaView>
  );
};

export default Chats;

const styles = StyleSheet.create({
  itemChat: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    width: 'auto',
    maxWidth: '80%',
    borderRadius: 8,
  },
  itemSender: {
    fontWeight: '600',
    color: 'black',
  },
  container: {
    flex: 1,
  },
});
