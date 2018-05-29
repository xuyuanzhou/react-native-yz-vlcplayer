/**
 * Created by yuanzhou.xu on 2018/5/14.
 */
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Modal,
  Platform,
} from 'react-native';
import VLCPlayer from '../VLCPlayer';
import PropTypes from 'prop-types';
import TimeLimt from './TimeLimit';
import ControlBtn from './ControlBtn';

export default class VLCPlayerView extends Component {
  static propTypes = {
    uri: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      paused: false,
      isLoading: true,
      loadingSuccess: false,
      isFull: false,
      currentTime: 0.0,
      totalTime: 0.0,
      showControls: false,
      seek: 0,
    };
    this.touchTime = 0;
    this.changeUrl = false;
  }

  static defaultProps = {
    initPaused: false,
    source: null,
    seek: 0,
    playInBackground: false,
    isGG: false,
    autoplay: true,
  };

  componentDidMount() {
    if (this.props.initPaused) {
      this.setState({
        paused: true,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.uri !== prevProps.uri) {
      this.changeUrl = true;
      this.vlcPlayer.seek(0);
      this.setState({
        isLoading: true,
        loadingSuccess: false,
        paused: true,
        currentTime: 0.0,
        totalTime: 0.0,
      });
    } else {
      if (this.props.initPaused !== prevProps.initPaused) {
        this.setState({
          paused: this.props.initPaused,
        });
      }
    }
  }

  render() {
    let { onEnd, style, isGG, type, isFull } = this.props;
    let { isLoading, loadingSuccess, showControls } = this.state;
    let showGG = false;
    let realShowLoding = false;
    if (loadingSuccess && isGG) {
      showGG = true;
    }
    if (isLoading) {
      realShowLoding = true;
    }

    return (
      <TouchableOpacity
    activeOpacity={1}
    style={[styles.videoBtn, style]}
    onPressOut={() => {
      let currentTime = new Date().getTime();
      if (this.touchTime === 0) {
        this.touchTime = currentTime;
        this.setState({ showControls: !this.state.showControls });
      } else {
        if (currentTime - this.touchTime >= 500) {
          this.touchTime = currentTime;
          this.setState({ showControls: !this.state.showControls });
        }
      }
    }}>
  <VLCPlayer
    ref={ref => (this.vlcPlayer = ref)}
    paused={this.state.paused}
    //seek={this.state.seek}
    style={[styles.video]}
    source={{ uri: this.props.uri, initOptions: ['--codec=avcodec'], autoplay: true }}
    onProgress={this.onProgress.bind(this)}
    onEnd={this.onEnded.bind(this)}
    onEnded={this.onEnded.bind(this)}
    onStopped={this.onEnded.bind(this)}
    onPlaying={this.onPlaying.bind(this)}
    onBuffering={this.onBuffering.bind(this)}
    onPaused={this.onPaused.bind(this)}
    progressUpdateInterval={250}
    onError={this._onError}
  />
    {showGG && (
    <View style={styles.GG}>
    <TimeLimt
      onEnd={() => {
      onEnd && onEnd();
    }}
      // maxTime={Math.ceil(this.state.totalTime)}
    />
    </View>
    )}
    {realShowLoding && (
    <View style={styles.loading}>
    <ActivityIndicator size={'large'} animating={true} color="#fff" />
      </View>
    )}
    {showControls && (
    <ControlBtn
      showSlider={!isGG}
      paused={this.state.paused}
      isFull={isFull}
      currentTime={this.state.currentTime}
      totalTime={this.state.totalTime}
      onPausedPress={this._play}
      onFullPress={this._toFullScreen}
      onValueChange={value => {
      this.changingSlider = true;
      this.setState({
        currentTime: value,
      });
    }}
      onSlidingComplete={value => {
      this.changingSlider = false;
      if (Platform.OS === 'ios') {
        this.vlcPlayer.seek(Number((value / this.state.totalTime).toFixed(17)));
      } else {
        this.vlcPlayer.seek(value);
      }
    }}
    />
    )}
  </TouchableOpacity>
  );
  }

  pause() {
    this.setState({ paused: !this.state.paused });
  }

  onPlaying(event) {
    console.log('onPlaying');
  }

  onPaused(event) {
    console.log('onPaused');
  }

  onBuffering(event) {
    if (this.changeUrl) {
      this.setState({ paused: false });
      this.changeUrl = false;
    }
    this.setState({
      isLoading: true
    });
    console.log('onBuffering');
    console.log(event);
  }

  _onError = e => {
    console.log('_onError');
    console.log(e);
  };

  onProgress(event) {
    /* console.log(
     'position=' +
     event.position +
     ',currentTime=' +
     event.currentTime +
     ',remainingTime=' +
     event.remainingTime,
     );*/
    let currentTime = event.currentTime;
    let loadingSuccess = false;
    if (currentTime > 0 || this.state.currentTime > 0) {
      loadingSuccess = true;
    }
    if (!this.changingSlider) {
      if (currentTime === 0 || currentTime === this.state.currentTime * 1000) {
      } else {
        this.setState({
          loadingSuccess: loadingSuccess,
          isLoading: false,
          progress: event.position,
          currentTime: event.currentTime / 1000,
          totalTime: event.duration / 1000,
        });
      }
    }
  }

  onEnded(event) {
    let { onEnd, autoplay } = this.props;
    this.setState({
      paused: false
    });
    onEnd && onEnd();
    this.vlcPlayer.resume && this.vlcPlayer.resume(autoplay || false);
    console.log(this.props.uri + ':   onEnded');
  }

  _toFullScreen = () => {
    let { startFullScreen, closeFullScreen, isFull } = this.props;
    if (isFull) {
      closeFullScreen && closeFullScreen();
    } else {
      startFullScreen && startFullScreen();
    }
  };

  _play = () => {
    this.setState({ paused: !this.state.paused });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoBtn: {
    flex: 1,
  },
  video: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  GG: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,1)',
    right: 10,
    top: 10,
    zIndex: 10,
    height: 30,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
