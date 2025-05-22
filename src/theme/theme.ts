import { Dimensions, StyleSheet } from "react-native";

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export const globalColors = {
  primary: '#19b428',
  secundary: '#f72585',
  tertiary: '#3a0ca3',
  success: '#4cc9f0',
  warning: '#fca311',
  danger: '#e71d36',
  darck: '#22223b',
  background: '#fff'
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: globalColors.background,
  },

  primaryButton: {
    backgroundColor: globalColors.primary,
    borderRadius: 5,
    padding: 10,
    margin: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center'
  },

  buttonText: {
    color: globalColors.background,
    fontSize: 18,
  },

  /***pantalla de login */
  topCard: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  bottomCard: {
    position: 'absolute',
    height: screenHeight * 0.8,
    width: screenWidth,  
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  
  handleLarge: {
    alignSelf: 'center',
    width: '90%',
    height: '10%',
    backgroundColor: '#ccc',
    borderRadius: 6,
    marginBottom: 20,
  },
  form: {
    paddingBottom: 50,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    color: globalColors.darck,
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    paddingVertical: 8,
    marginBottom: 20,
  },
});
