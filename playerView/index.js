/**
 * Created by yuanzhou.xu on 2018/5/15.
 */

import React, { Component } from 'react';
import {
  StatusBar,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  Dimensions,
  BackHandler,
} from 'react-native';

import VLCPlayerView from './VLCPlayerView';
import PropTypes from 'prop-types';

const _fullKey = 'commonVideo_android_fullKey';

export default class CommonVideo extends Component {
  constructor(props) {
    super(props);
    this.url = '';
  }

  static navigationOptions = {
    header: null,
  };

  state = {
    isEndGG: false,
    isFull: false,
    paused: true,
    currentUrl: '',
  };

  static defaultProps = {
    height: 250,
    showGG: true,
    ggUrl: '',
    url: '',
  };

  static propTypes = {
    /**
     * 视频播放结束
     */
    onEnd: PropTypes.func,

    /**
     * 广告头播放结束
     */
    onGGEnd: PropTypes.func,

    /**
     * 开启全屏
     */
    startFullScreen: PropTypes.func,
    /**
     * 关闭全屏
     */
    closeFullScreen: PropTypes.func,
  };

  static getDerivedStateFromProps(nextProps, preState) {
    let { url } = nextProps;
    let { currentUrl } = preState;
    if (url && url !== currentUrl) {
      return {
        currentUrl: url,
        paused: true,
        isEndGG: false,
      };
    }
    return null;
  }

  componentWillUnmount() {
    let { isFull } = this.props;
    if (isFull) {
      this._closeFullScreen();
    }
  }

  _closeFullScreen = () => {
    let { closeFullScreen, BackHandle, Orientation } = this.props;
    this.setState({ isFull: false });
    BackHandle && BackHandle.removeBackFunction(_fullKey);
    Orientation && Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    closeFullScreen && closeFullScreen();
  };

  _toFullScreen = () => {
    let { startFullScreen, BackHandle, Orientation } = this.props;
    this.setState({ isFull: true });
    BackHandle && BackHandle.addBackFunction(_fullKey, this._closeFullScreen);
    startFullScreen && startFullScreen();
    Orientation && Orientation.lockToLandscape && Orientation.lockToLandscape();
  };

  render() {
    let { url, ggUrl, showGG, onGGEnd, onEnd, style, height } = this.props;
    let { isEndGG, isFull, currentUrl } = this.state;
    let realShowGG = false;
    if (showGG && ggUrl && !isEndGG) {
      realShowGG = true;
    }
    let type = '';
    let showVideo = false;
    if (currentUrl) {
      showVideo = true;
      let types = currentUrl.split('.');
      if (types && types.length > 0) {
        type = types[types.length - 1];
      }
    }
    let ggType = '';
    if (ggUrl) {
      let types = ggUrl.split('.');
      if (types && types.length > 0) {
        ggType = types[types.length - 1];
      }
    }
    return (
      <View
        style={[isFull ? styles.container : { height: 250, backgroundColor: '#000' }, style]}>
        {realShowGG && (
          <VLCPlayerView
            {...this.props}
            uri={ggUrl}
            source={{ uri: ggUrl, type: ggType }}
            type={ggType}
            isGG={true}
            isFull={isFull}
            onEnd={() => {
              onGGEnd && onGGEnd();
              this.setState({ isEndGG: true, paused: false });
            }}
            startFullScreen={this._toFullScreen}
            closeFullScreen={this._closeFullScreen}
          />
        )}

        {showVideo &&
          isEndGG && (
            <VLCPlayerView
              {...this.props}
              uri={currentUrl}
              type={type}
              isFull={isFull}
              hadGG={true}
              isEndGG={isEndGG}
              initPaused={this.state.paused}
              style={showGG && !isEndGG ? { position: 'absolute', zIndex: -1 } : {}}
              source={{ uri: currentUrl, type: type }}
              startFullScreen={this._toFullScreen}
              closeFullScreen={this._closeFullScreen}
              onEnd={() => {
                this.setState({ paused: true });
                onEnd && onEnd();
              }}
            />
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
