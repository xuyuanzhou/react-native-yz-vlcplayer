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
  Animated,
} from 'react-native';
import VLCPlayer from '../VLCPlayer';
import PropTypes from 'prop-types';
import TimeLimt from './TimeLimit';
import ControlBtn from './ControlBtn';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getStatusBarHeight } from './SizeController';

function getDeviceHeight() {
  return Dimensions.get('window').height;
}

function getDeviceWidth() {
  return Dimensions.get('window').height;
}

const getTime = (data = 0) => {
  let hourCourse = Math.floor(data / 3600);
  let diffCourse = data % 3600;
  let minCourse = Math.floor(diffCourse / 60);
  let secondCourse = Math.floor(diffCourse % 60);
  let courseReal = '';
  if (hourCourse) {
    if (hourCourse < 10) {
      courseReal += '0' + hourCourse + ':';
    } else {
      courseReal += hourCourse + ':';
    }
  }
  if (minCourse < 10) {
    courseReal += '0' + minCourse + ':';
  } else {
    courseReal += minCourse + ':';
  }
  if (secondCourse < 10) {
    courseReal += '0' + secondCourse;
  } else {
    courseReal += secondCourse;
  }
  return courseReal;
};

export default class VLCPlayerView extends Component {
  static propTypes = {
    uri: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      paused: true,
      isLoading: true,
      loadingSuccess: false,
      isFull: false,
      currentTime: 0,
      totalTime: 0,
      showControls: false,
      seek: 0,
      volume: 200,
      muted: false,
      isError: false,
      chapterPosition: new Animated.Value(-250),
    };
    this.touchTime = 0;
    this.viewingTime = 0;
    this.initSuccess = false;
  }

  static defaultProps = {
    initPaused: false,
    source: null,
    seek: 0,
    playInBackground: false,
    isAd: false,
    autoplay: true,
    lookTime: 0,
    totalTime: 0,
  };

  componentDidMount() {
    if (this.props.isFull) {
      this.setState({
        showControls: true,
      });
    }
  }

  componentWillUnmount() {
    if (this.bufferInterval) {
      clearInterval(this.bufferInterval);
      this.bufferInterval = null;
    }
  }

  _showChapter = () => {
    if (this.showChapter) {
      this._hideChapter();
    } else {
      this.showChapter = true;
      Animated.timing(this.state.chapterPosition, {
        toValue: 0,
        //easing: Easing.back,
        duration: 500,
      }).start();
    }
  };

  _hideChapter = (time = 250) => {
    this.showChapter = false;
    Animated.timing(this.state.chapterPosition, {
      toValue: -250,
      //easing: Easing.back,
      duration: time,
    }).start();
  };

  _renderTopView = () => {
    let {
      onEnd,
      isFull,
      title,
      onLeftPress,
      onCloseFullScreen,
      showBack,
      showTitle,
      isAd,
      type,
    } = this.props;
    let { loadingSuccess } = this.state;
    let showAd = false;
    if(isAd && this.initSuccess){
      showAd = true;
    }
    let { showControls } = this.state;
    return (
      <View style={[styles.topView, !showControls ? { backgroundColor: 'rgba(0,0,0,0)' } : {}]}>
        <View style={styles.backBtn}>
          {showBack && (
            <TouchableOpacity
              onPress={() => {
                if (isFull) {
                  onCloseFullScreen && onCloseFullScreen();
                } else {
                  onLeftPress && onLeftPress();
                }
              }}
              style={styles.btn}
              activeOpacity={0.8}>
              <Icon name={'chevron-left'} size={30} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={{ justifyContent: 'center', flex: 1, marginRight: 10 }}>
            {showTitle &&
              showControls && (
                <Text style={{ color: '#fff', fontSize: 12 }} numberOfLines={1}>
                  {title}
                </Text>
              )}
          </View>
          {isFull &&
            showControls && (
              <TouchableOpacity
                style={{
                  width: 40,
                  marginRight: 10,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={this._showChapter}>
                <Text style={{ fontSize: 13, color: this.showChapter ? 'red' : '#fff' }}>
                  章节
                </Text>
              </TouchableOpacity>
            )}
          <View />
          {showAd && (
            <View style={styles.ad}>
              <TimeLimt
                onEnd={() => {
                  onEnd && onEnd();
                }}
                //maxTime={Math.ceil(this.state.totalTime)}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  render() {
    let {
      onEnd,
      style,
      isAd,
      type,
      isFull,
      uri,
      title,
      onLeftPress,
      videoAspectRatio,
      chapterElements,
    } = this.props;
    let { isLoading, loadingSuccess, showControls, isError, currentTime } = this.state;
    let showAd = false;
    let realShowLoding = false;
    let source = {};

    let doFast = false;
    if (this.initialCurrentTime && this.initialCurrentTime < currentTime) {
      doFast = true;
    }

    if (uri) {
      if (uri.split) {
        source = { uri: this.props.uri };
      } else {
        source = uri;
      }
    }
    if(isAd && this.initSuccess){
      showAd = true;
    }
    realShowLoding = isLoading;

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.videoBtn, style]}
        onPressOut={() => {
          let currentTime = new Date().getTime();
          if (this.touchTime === 0) {
            this.touchTime = currentTime;
            if (this.state.showControls) {
              this._hideChapter(0);
            }
            this.setState({ showControls: !this.state.showControls });
          } else {
            if (currentTime - this.touchTime >= 500) {
              if (this.state.showControls) {
                this._hideChapter(0);
              }
              this.touchTime = currentTime;
              this.setState({ showControls: !this.state.showControls });
            }
          }
        }}>
        <VLCPlayer
          ref={ref => (this.vlcPlayer = ref)}
          style={[styles.video]}
          source={source}
          volume={this.state.volume}
          muted={this.state.muted}
          videoAspectRatio={videoAspectRatio}
          onProgress={this.onProgress.bind(this)}
          onEnd={this.onEnded.bind(this)}
          onStopped={this.onEnded.bind(this)}
          onPlaying={this.onPlaying.bind(this)}
          onBuffering={this.onBuffering.bind(this)}
          onPaused={this.onPaused.bind(this)}
          progressUpdateInterval={250}
          onError={this._onError}
          onOpen={this._onOpen}
          onLoadStart={this._onLoadStart}
          onSnapshot={this._onSnapshot}
          onIsPlaying={this._onIsPlaying}
        />
        {realShowLoding &&
          !isError && (
            <View style={styles.loading}>
              <ActivityIndicator size={'large'} animating={true} color="#fff" />
            </View>
          )}
        {isError && (
          <View style={[styles.loading, { backgroundColor: '#000' }]}>
            <Text style={{ color: 'red' }}>视频播放出错,请重新加载</Text>
            <TouchableOpacity
              activeOpacity={1}
              onPress={this._reload}
              style={{
                width: 100,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}>
              <Icon name={'reload'} size={45} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        {this.changingSlider && (
          <View style={[styles.loading, { backgroundColor: 'rgba(0,0,0,0)' }]}>
            <View
              style={{
                width: 95,
                height: 58.5,
                borderRadius: 3,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
              }}>
              <Icon name={doFast ? 'fast-forward' : 'rewind'} size={30} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 11.5 }}>
                {getTime(this.state.currentTime) + '/' + getTime(this.state.totalTime)}
              </Text>
            </View>
          </View>
        )}
        {this._renderTopView()}
        <Animated.ScrollView
          style={{
            borderTopWidth: isFull ? 1 : 0,
            borderBottomWidth: isFull ? 1 : 0,
            borderColor: '#000',
            top: 37,
            backgroundColor: 'rgba(0,0,0,0.6)',
            right: this.state.chapterPosition,
            height: isFull ? getDeviceHeight() - 37 - 37 : 0,
            position: 'absolute',
            width: 220,
          }}>
          {chapterElements}
        </Animated.ScrollView>
        <View style={[styles.bottomView]}>
          {showControls && (
            <ControlBtn
              //style={isFull?{width:deviceHeight}:{}}
              showSlider={!isAd}
              showAd={showAd}
              onEnd={onEnd}
              title={title}
              muted={this.state.muted}
              onMutePress={()=>{
                this.setState({
                   muted: !this.state.muted
                });
              }}
              onLeftPress={onLeftPress}
              paused={this.state.paused}
              isFull={isFull}
              currentTime={this.state.currentTime}
              totalTime={this.state.totalTime}
              onPausedPress={this._play}
              onFullPress={this._toFullScreen}
              onValueChange={value => {
                if (!this.changingSlider) {
                  this.initialCurrentTime = this.state.currentTime;
                }
                this.changingSlider = true;
                this.setState({
                  currentTime: value,
                });
              }}
              onSlidingComplete={value => {
                this.changingSlider = false;
                this.initialCurrentTime = 0;
                if (Platform.OS === 'ios') {
                  this.vlcPlayer.seek(Number((value / this.state.totalTime).toFixed(17)));
                } else {
                  this.vlcPlayer.seek(value);
                }
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  snapshot = (path)=>{
    this.vlcPlayer && this.vlcPlayer.snapshot(path);
  }


  /**
   * 视频播放
   * @param event
   */
  onPlaying(event) {
    /*console.log(event);
    if (this.state.paused) {
      this.setState({ paused: false });
    }*/
    console.log('onPlaying');
  }

  /**
   * 视频停止
   * @param event
   */
  onPaused(event) {
   /* console.log(event);
    if (!this.state.paused) {
      this.setState({ paused: true });
    }*/
    console.log('onPaused');
  }

  /**
   * 视频缓冲
   * @param event
   */
  onBuffering(event) {
    let { isPlaying, duration } = event;
    if(isPlaying){
      if(!this.initSuccess){
        this.initSuccess = true;
      }
      if(duration <= 0){
        this.setState({
          isLoading: false,
          isError: false,
        });
      }else{
        this.setState({
          isLoading: true,
          isError: false,
        });
      }
    }else{
      this.setState({
        isLoading: true,
        isError: false,
        paused: false,
      });
    }

   /* this.bufferTime = new Date().getTime();
    if (!this.bufferInterval) {
      console.log('bufferIntervalFunction');
      this.bufferInterval = setInterval(this.bufferIntervalFunction, 250);
    }*/
    console.log(event);
  }

  _onIsPlaying=(event)=>{
    if(event.isPlaying){
      this.setState({
        paused: false,
      });
    }else{
      this.setState({
        paused: true,
      });
    }
    //console.log(event)
  }

  bufferIntervalFunction = () => {
    //console.log('bufferIntervalFunction');
    let currentTime = new Date().getTime();
    let diffTime = currentTime - this.bufferTime;
    if (diffTime > 2500) {
      clearInterval(this.bufferInterval);
      this.setState({
        isLoading: false,
      });
      /*this.setState({
        paused: true,
      },()=>{
        this.setState({
          paused: false,
          isLoading: false,
        });
      });*/
      this.bufferInterval = null;
      console.log('remove  bufferIntervalFunction');
    }
  };

  _onError = e => {
    console.log('_onError');
    console.log(e);
    this.setState({
      isError: true,
      paused: true,
    });
  };

  _onSnapshot = e => {
    console.log('_onSnapshot')
    console.log(e);
    this.props.onSnapshot &&  this.props.onSnapshot(e);
  }

  _onOpen = e => {
    console.log('onOpen');
    console.log(e);
  };

  _onLoadStart = e => {
    // console.log('_onLoadStart');
    this.initSuccess = false;
    let { onEnd, isAd, uri, lookTime, totalTime } = this.props;
    console.log('_onLoadStart ---------uri->' + uri + '---isAd----' + isAd);
    let { isError } = this.state;
    if (isError) {
      let { currentTime, totalTime } = this.state;
      if (Platform.OS === 'ios') {
        this.vlcPlayer.seek(Number((currentTime / totalTime).toFixed(17)));
      } else {
        this.vlcPlayer.seek(currentTime);
      }
      this.vlcPlayer.play(false);
      this.setState({
        isError: false,
      });
    } else {
      this.vlcPlayer.play(false);
      if (lookTime && totalTime) {
        if (Platform.OS === 'ios') {
          this.vlcPlayer.seek(Number((lookTime / totalTime).toFixed(17)));
        } else {
          this.vlcPlayer.seek(lookTime);
        }
      } else {
        this.vlcPlayer.seek(0);
      }
      this.setState({
        isLoading: true,
        isError: false,
        currentTime: 0.0,
        totalTime: 0.0,
      });
    }
  };

  _reload = () => {
    this.vlcPlayer.resume && this.vlcPlayer.resume(false);
  };

  /**
   * 视频进度变化
   * @param event
   */
  onProgress(event) {
    /*console.log(
     'position=' +
     event.position +
     ',currentTime=' +
     event.currentTime +
     ',remainingTime=' +
     event.remainingTime,
     );*/
    //console.log(event);
    let currentTime = event.currentTime;
    let loadingSuccess = false;
    if (currentTime > 0 || this.state.currentTime > 0) {
      loadingSuccess = true;
    }
    if (!this.changingSlider) {
      if (currentTime === 0 || currentTime === this.state.currentTime * 1000) {
        this.setState({
          isLoading: false
        });
      } else {
        this.setState({
          loadingSuccess: loadingSuccess,
          isLoading: false,
          isError: false,
          progress: event.position,
          currentTime: event.currentTime / 1000,
          totalTime: event.duration / 1000,
        });
        this.props.onProgressChange &&
          this.props.onProgressChange({
            currentTime: event.currentTime / 1000,
            totalTime: event.duration / 1000,
          });
      }
    }
  }

  /**
   * 视频播放结束
   * @param event
   */
  onEnded(event) {
    console.log(event);
    this.vlcPlayer.play(true);
    let { currentTime, totalTime } = this.state;
    let { onEnd, isAd, uri } = this.props;
    console.log('onEnded ---------uri->' + uri);
    let result = {
      viewingTime: this.viewingTime,
      totalTime: totalTime,
      currentTime: currentTime,
    };

    if (totalTime <= 0) {
      if (isAd) {
        this.setState(
          {
            paused: true,
            showControls: false,
          },
          () => {
            onEnd && onEnd(result);
          },
        );
      }
    } else {
      if (currentTime + 5 >= totalTime || isAd) {
        this.setState(
          {
            paused: true,
            showControls: false,
          },
          () => {
            onEnd && onEnd(result);
          },
        );
      } else {
        this.setState(
          {
            paused: true,
          },
          () => {
            this.vlcPlayer.play(false);
          },
        );
      }
    }
  }

  /**
   * 全屏
   * @private
   */
  _toFullScreen = () => {
    let { onStartFullScreen, onCloseFullScreen, isFull } = this.props;
    if (isFull) {
      onCloseFullScreen && onCloseFullScreen();
    } else {
      onStartFullScreen && onStartFullScreen();
    }
  };

  /**
   * 播放/停止
   * @private
   */
  _play = () => {
    this.vlcPlayer.play(!this.state.paused);
    this.setState({ paused: !this.state.paused });
  };

  stop = () => {
    this.vlcPlayer.play(true);
    this.setState({ paused: true, showControls: false });
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
  ad: {
    backgroundColor: 'rgba(255,255,255,1)',
    height: 30,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  topView: {
    top: 0,//Platform.OS === 'ios' ? statusBarHeight : 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    left: 0,
    height: 37,
    zIndex: 999,
    position: 'absolute',
    width: '100%',
  },
  backBtn: {
    height: 37,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    //marginLeft: 10,
    marginRight: 8,
    paddingTop: 3,
    justifyContent: 'center',
    alignItems: 'center',
    height: 37,
    width: 40,
  },

  bottomView: {
    bottom: 0,
    left: 0,
    height: 37,
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
  },
});
