import { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  onSend: (message: string) => void;
};

const InputReply = ({ onSend = () => null }: Props) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    onSend(message);
    setMessage('');
  };
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          multiline
          style={styles.input}
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
      </View>
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Image source={require('../../assets/images/send.png')} style={{ width: 20, height: 20 }} />
      </TouchableOpacity>
    </View>
  );
};

export default InputReply;

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 4,
    flex: 1,
    borderColor: '#adb5bd',
  },
  input: {
    maxHeight: 60,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 42,
    backgroundColor: '#52b788',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
