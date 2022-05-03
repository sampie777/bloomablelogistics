/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './source/App';
import {name as appName} from './app.json';

// Dirty fix for react-native-cache (https://github.com/timfpark/react-native-cache/issues/42#issuecomment-1049938333)
console.dir = () => {};

AppRegistry.registerComponent(appName, () => App);
