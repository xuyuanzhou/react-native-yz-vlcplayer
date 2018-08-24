import React from 'react';
import ReactNative from 'react-native';

const { Component } = React;

import PropTypes from 'prop-types';

const { StyleSheet, requireNativeComponent, NativeModules, View } = ReactNative;
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

export default class VLCPlayer extends Component {
  constructor(props, context) {
    super(props, context);
    this.seek = this.seek.bind(this);
    this.resume = this.resume.bind(this);
    this.play = this.play.bind(this);
    this.snapshot = this.snapshot.bind(this);
    this._assignRoot = this._assignRoot.bind(this);
    this._onProgress = this._onProgress.bind(this);
    this._onLoadStart = this._onLoadStart.bind(this);
    this._onSnapshot = this._onSnapshot.bind(this);
    this._onIsPlaying = this._onIsPlaying.bind(this);
    this._onVideoStateChange = this._onVideoStateChange.bind(this);

  }

  static defaultProps = {
    autoplay: true,
  };

  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  seek(pos) {
    this.setNativeProps({ seek: pos });
  }

  play(paused){
    this.setNativeProps({ paused: paused });
  }

  resume(isResume) {
    this.setNativeProps({ resume: isResume });
  }

  snapshot(path) {
    this.setNativeProps({ snapshotPath: path });
  }

  _assignRoot(component) {
    this._root = component;
  }

  _onVideoStateChange(event){
    let type = event.nativeEvent.type;
    switch (type){
      case 'Opening':
        this.props.onOpen && this.props.onOpen(event.nativeEvent);
        break;
      case 'Playing':
        this.props.onPlaying && this.props.onPlaying(event.nativeEvent);
        break;
      case 'Paused':
        this.props.onPaused && this.props.onPaused(event.nativeEvent);
        break;
      case 'Stoped':
        this.props.onStopped && this.props.onStopped(event.nativeEvent);
        break;
      case 'Ended':
        this.props.onEnd && this.props.onEnd(event.nativeEvent);
        break;
      case 'Buffering':
        this.props.onBuffering && this.props.onBuffering(event.nativeEvent);
        break;
      case 'Error':
        this.props.onError && this.props.onError(event.nativeEvent);
        break;
      default:
        this.props.onVideoStateChange && this.props.onVideoStateChange(event);
        break;
    }
  }

  _onLoadStart(event){
    if (this.props.onLoadStart) {
      this.props.onLoadStart(event.nativeEvent);
    }
  }

  _onProgress(event) {
    if (this.props.onProgress) {
      this.props.onProgress(event.nativeEvent);
    }
  }


  _onIsPlaying(event){
    if(this.props.onIsPlaying){
      this.props.onIsPlaying(event.nativeEvent);
    }
  }

  _onSnapshot(event){
    if (this.props.onSnapshot) {
      this.props.onSnapshot(event.nativeEvent);
    }
  }

  render() {
    const source = resolveAssetSource(this.props.source) || {};
    let uri = source.uri || '';
    let isNetwork = !!(uri && uri.match(/^https?:/));
    const isAsset = !!(uri && uri.match(/^(assets-library|file|content|ms-appx|ms-appdata):/));
    if(!isAsset){
      isNetwork = true;
    }
    if (uri && uri.match(/^\//)) {
      isNetwork = false;
    }
    source.initOptions = source.initOptions || [];
    source.isNetwork = isNetwork;
    source.autoplay = this.props.autoplay;
    //repeat the input media
    source.initOptions.push('--input-repeat=1000');
    const nativeProps = Object.assign({}, this.props);
    Object.assign(nativeProps, {
      style: [styles.base, nativeProps.style],
      source: source,
      onVideoLoadStart: this._onLoadStart,
      onVideoProgress: this._onProgress,
      onVideoStateChange: this._onVideoStateChange,
      onSnapshot: this._onSnapshot,
      onIsPlaying: this._onIsPlaying,
      progressUpdateInterval: 250,
    });

    return <RCTVLCPlayer ref={this._assignRoot} {...nativeProps} />;
  }
}

VLCPlayer.propTypes = {
  /* Native only */
  rate: PropTypes.number,
  seek: PropTypes.number,
  resume: PropTypes.bool,
  snapshotPath: PropTypes.string,
  paused: PropTypes.bool,
  videoAspectRatio: PropTypes.string,
  /**
   * 0 --- 200
   */
  volume: PropTypes.number,
  repeat: PropTypes.bool,
  muted: PropTypes.bool,


  onVideoLoadStart: PropTypes.func,
  onVideoStateChange: PropTypes.func,
  onVideoProgress: PropTypes.func,
  onSnapshot: PropTypes.func,
  onIsPlaying: PropTypes.func,

  /* Wrapper component */
  source: PropTypes.object,
  play: PropTypes.func,
  snapshot: PropTypes.func,
  onError: PropTypes.func,
  onProgress: PropTypes.func,
  onEnded: PropTypes.func,
  onStopped: PropTypes.func,
  onPlaying: PropTypes.func,
  onPaused: PropTypes.func,

  /* Required by react-native */
  scaleX: PropTypes.number,
  scaleY: PropTypes.number,
  translateX: PropTypes.number,
  translateY: PropTypes.number,
  rotation: PropTypes.number,
  ...View.propTypes,
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
const RCTVLCPlayer = requireNativeComponent('RCTVLCPlayer', VLCPlayer);
