// Exported from snack.expo.io
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { FileSystem } from 'expo';
import {
  Linking,
  Button,
  WebView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  SwipeableListView,
  TouchableHighlight,
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { atob } from 'Base64';
import { Ionicons } from '@expo/vector-icons';

import downloadPageAsync from './downloadPageAsync';

const Colors = {
  tintColor: '#FE504D',
  listRow: '#FFF',
  hairline: '#C8C7CC',
  deleteButton: '#FF3B30',
  deleteButtonText: '#FEFEFF',
};

const PAGES_DIR = `${FileSystem.documentDirectory}pages/`;

const defaultUrls = [
  'https://docs.expo.io/versions/latest/index.html',
  'https://docs.expo.io/versions/latest/sdk/filesystem.html',
];

class AddPageButton extends React.Component {
  handlePress = () => {
    this.props.navigation.navigate('Download');
  };

  render() {
    return (
      <TouchableOpacity style={styles.addButton} onPress={this.handlePress}>
        <Ionicons name="ios-add" size={36} color={Colors.tintColor} />
      </TouchableOpacity>
    );
  }
}

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerRight: <AddPageButton navigation={navigation} />,
  });

  state = {
    dataSource: SwipeableListView.getNewDataSource(),
    filenames: [],
  };

  async componentDidMount() {
    // try {
    //   await FileSystem.deleteAsync(PAGES_DIR);
    // } catch (e) {}
    const { exists } = await FileSystem.getInfoAsync(PAGES_DIR);
    if (!exists) {
      await FileSystem.makeDirectoryAsync(PAGES_DIR, { intermediates: true });
      for (const url of defaultUrls) {
        await downloadPageAsync(url, PAGES_DIR);
      }
    }
    await this.readFilesAsync();
  }

  async readFilesAsync() {
    const filenames = await FileSystem.readDirectoryAsync(PAGES_DIR);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(
        { s1: filenames },
        ['s1']
      ),
    });
  }

  handleRowPress = name => {
    this.props.navigation.navigate('Browser', { uri: PAGES_DIR + name });
  };

  handleDeletePress = async name => {
    await FileSystem.deleteAsync(PAGES_DIR + name);
    await this.readFilesAsync();
  };

  renderRow = name =>
    <TouchableHighlight onPress={() => this.handleRowPress(name)}>
      <View style={styles.row}>
        <Text>
          {atob(name.replace(/\.html$/, ''))}
        </Text>
      </View>
    </TouchableHighlight>;

  renderSeparator = (sectionID, rowID) => {
    const allRowIDs = this.state.dataSource.rowIdentities;
    const lastSectionRowIDs = allRowIDs[allRowIDs.length - 1];
    const isLastRow = rowID === lastSectionRowIDs[lastSectionRowIDs.length - 1];
    if (isLastRow) {
      return null;
    }
    return (
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
      </View>
    );
  };

  renderQuickActions = name =>
    <View style={styles.actionsContainer}>
      <TouchableHighlight
        style={styles.deleteButton}
        onPress={() => this.handleDeletePress(name)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableHighlight>
    </View>;

  render() {
    return (
      <SwipeableListView
        style={styles.listView}
        enableEmptySections={true}
        contentContainerStyle={styles.container}
        dataSource={this.state.dataSource}
        maxSwipeDistance={80}
        renderRow={this.renderRow}
        renderSeparator={this.renderSeparator}
        renderQuickActions={this.renderQuickActions}
      />
    );
  }
}

class DownloadScreen extends React.Component {
  state = { url: '' };

  handleUrlChange = url => this.setState({ url });

  handlePress = async () => {
    if (this.state.url) {
      await downloadPageAsync(this.state.url, PAGES_DIR);
      this.props.navigation.navigate('Home');
    }
  };

  render() {
    return (
      <View>
        <TextInput
          style={styles.urlInput}
          placeholder="https://example.com/index.html"
          value={this.state.url}
          onChangeText={this.handleUrlChange}
        />
        <Button
          title="Add"
          color={Colors.tintColor}
          onPress={this.handlePress}
        />
      </View>
    );
  }
}

class BrowserScreen extends React.Component {
  render() {
    const { width, height } = Dimensions.get('window');
    return (
      <WebView
        source={{ uri: this.props.navigation.state.params.uri }}
        style={{ width, height }}
      />
    );
  }
}

export default StackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Download: {
      screen: DownloadScreen,
    },
    Browser: {
      screen: BrowserScreen,
    },
  },
  {
    navigationOptions: {
      headerTintColor: Colors.tintColor,
    },
  }
);

const styles = StyleSheet.create({
  listView: {
    marginTop: -StyleSheet.hairlineWidth,
  },
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.hairline,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.hairline,
  },
  separator: {
    paddingLeft: 15,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.listRow,
  },
  separatorLine: {
    flex: 1,
    backgroundColor: Colors.hairline,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: Colors.listRow,
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.deleteButton,
  },
  deleteButtonText: {
    color: Colors.deleteButtonText,
    fontSize: 17,
    fontWeight: '500',
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urlInput: {
    backgroundColor: 'white',
    height: 40,
    paddingHorizontal: 15,
  },
});
