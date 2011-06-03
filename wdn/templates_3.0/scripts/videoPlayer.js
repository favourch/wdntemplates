/** 
 * This plugin is intended for videos.
 * 
 * 1. Check for HTML5 video browser capability
 * 2. Setup HTML5 element or Flash alternative
 * 3. if HTML5, use custom video controls
 * 
 */
function playerReady(thePlayer) {
    //start the player and JS API
    WDN.videoPlayer.createFallback.addJWListeners(document.getElementById(thePlayer.id));
}

WDN.videoPlayer = function() {
	var i = 0;
	var agent = navigator.userAgent.toLowerCase();
    var is_iphone = (agent.indexOf('iphone')!='-1');
    var is_ipad = (agent.indexOf('ipad')!='-1');
    var requiresFallback = true;
    
	return {
		
		initialize : function() {
			WDN.jQuery('video').each(function(){
				var video = WDN.jQuery(this)[0];
				WDN.videoPlayer.html5Video(video);
			});
			WDN.jQuery('audio').each(function(){
				var audio = WDN.jQuery(this)[0];
				WDN.videoPlayer.html5Audio(audio);
				WDN.jQuery(audio).siblings('.wdnVideo_controls').children('.progress').hide();
			});
			
		},
		
		supportsVideo: function() {
			return !!document.createElement('video').canPlayType;
		},
		
		supportsAudio: function() {
			return !!document.createElement('audio').canPlayType;
		},
		
		supportsH264: function() {
			var v = document.createElement("video");
			if (v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') != '') {
				return true;
			}
			return false;
		},
		
		supportsWebM: function() {
			var v = document.createElement("video");
			if (v.canPlayType('video/webm; codecs="vp8, vorbis"') != '') {
				return true;
			}
			return false;
		},
		
		supportsMP3: function() {
			var v = document.createElement("audio");
			if (v.canPlayType('audio/mpeg') != '') {
				return true;
			}
			return false;
		},
		
		html5Video : function(video) {
			if (WDN.jQuery(video).data('wdn_player')) {
				return;
			} else {
				WDN.jQuery(video).data('wdn_player', true);
			}
			
			var src = video.src || WDN.jQuery(video).children('source').attr('src') || "";
			if (WDN.videoPlayer.supportsVideo()) {
				if (WDN.videoPlayer.supportsH264()){ //can we support H264?
					if (src) { //make sure we have a source
						requiresFallback = false;
					}
				}
			}
			WDN.log('requiresFallback (video): '+requiresFallback);
			if (requiresFallback) {
				WDN.videoPlayer.createFallback.setupJWPlayer(video, "video");
			} else {
				if (!is_ipad && !is_iphone){
					WDN.loadCSS('/wdn/templates_3.0/css/content/videoPlayer.css');
					WDN.videoPlayer.setupControls.initialize(video);
				}
				WDN.videoPlayer.eventControls.bindControls(video);
			}
		},
		
		html5Audio : function(audio) {
			if (WDN.jQuery(audio).data('wdn_player')) {
				return;
			} else {
				WDN.jQuery(audio).data('wdn_player', true);
			}
						
			var src = audio.src || WDN.jQuery(audio).children('source').attr('src') || "";
			if (WDN.videoPlayer.supportsAudio()){
				if (WDN.videoPlayer.supportsMP3()){ //can we support MP3?
					if (src) { //make sure we have a source
						requiresFallback = false;
					}
				}
			}
			WDN.log('requiresFallback (audio): '+requiresFallback);
			if (requiresFallback){
				WDN.videoPlayer.createFallback.setupJWPlayer(audio, "audio");
			} else {
				if (!is_ipad && !is_iphone){
					WDN.loadCSS('/wdn/templates_3.0/css/content/videoPlayer.css');
					WDN.videoPlayer.setupControls.initialize(audio);
				}
				WDN.videoPlayer.eventControls.bindControls(audio);
			}
		},
		
		createFallback : function() { //call the flash player option	
			var currentPosition = 0; //the current position of the video last played
			return {
				
				setupJWPlayer : function(video, type) {
					var $media = WDN.jQuery(video), $children;
					// IE 7 & 8 do not render video/audio elements in the DOM
					// This fix corrects the heirarchy
					var badIEElements = document.getElementsByTagName('/' + type);
					if (badIEElements.length) {
						var childAsSiblings = [], cur = $media;
						while (cur.length) {
							cur = cur.next();
							if (WDN.jQuery.inArray(cur[0], badIEElements) < 0) {
								childAsSiblings.push(cur[0]);
							} else {
								cur.remove();
								break;
							}
						}
						$children = WDN.jQuery(childAsSiblings);
					} else {
						$children = $media.children();
					}
					
					var src = video.src || $children.filter('source').attr('src');
					WDN.loadJS('wdn/templates_3.0/scripts/plugins/swfobject/jquery.swfobject.1-1-1.min.js', function(){
						if (typeof src !== 'undefined')
							src = WDN.toAbs(src, window.location.toString());
						var width = video.width || $media.width();
						var height = video.height || $media.height();
						var enablejs = 'true';
						var allowfullscreen = 'true';
						var flashVars = {
							'file': src,
							'image': video.poster || "",
							'skin': 'wdn/templates_3.0/includes/swf/UNLVideoSkin.swf',
							'icons': 'true',
							'autostart': 'false',
							'controlbar': 'over'
						};
						WDN.log(type);
						if (type == 'audio') {
							height = 60;
							allowfullscreen = 'false';
							flashVars.skin = 'wdn/templates_3.0/includes/swf/UNLAudioSkin.swf';
							flashVars.icons = 'false';
							flashVars.screencolor = 'FFFFFF';
							flashVars.controlbar = 'bottom';
						}
						flashVars.skin = WDN.template_path + flashVars.skin;
						if (video.autoplay || WDN.jQuery('video').eq(i).attr('autoplay')) {
							flashVars.autostart = 'true';
						}
						WDN.log(flashVars.skin);
						$media.wrap("<div id='wdnVideo_"+i+"' style='min-height:60px;' />");
						
						//Fallback for flash
						WDN.jQuery('#wdnVideo_'+i).prepend('<p>To view this video you should download <a href="http://get.adobe.com/flashplayer/">Adobe Flash Player</a> or use a browser that supports H264/WebM video. You may also download the <a href="' + src + '">video</a></p>');
						
						WDN.jQuery('#wdnVideo_'+i).flash(
							{     
								swf: WDN.template_path + 'wdn/templates_3.0/includes/swf/player4.3.swf',   
								allowfullscreen: allowfullscreen,
								allowscriptaccess: 'always',
								wmode: 'transparent',
								flashvars: flashVars,
								height: height,
								width: width,
								id: 'jwPlayer_'+i,
								name: 'jwPlayer_'+i
							}
						);
						WDN.jQuery('#wdnVideo_'+i).data('wdn_player', {
							src: src,
							played: false
						});
						$media.remove();
						$children.remove();
						i++;
					});
				},
				
				addJWListeners : function(video) {
					video.addModelListener('TIME', 'WDN.videoPlayer.createFallback.timeListener');
					video.addModelListener('STATE', "WDN.videoPlayer.createFallback.onStateChange");
					video.addModelListener('META', "WDN.videoPlayer.createFallback.metaListener");
					video.addControllerListener('RESIZE',"WDN.videoPlayer.createFallback.onFullscreen");
					WDN.jQuery(window).bind('unload', {"video": video}, WDN.videoPlayer.createFallback.onClose);
					WDN.log('listeners added to '+video);
					
				},

				timeListener : function(obj) {
					currentPosition = obj.position;
					var wdnPlayer = WDN.jQuery('#' + obj.id).parent().data('wdn_player');
					wdnPlayer.position = obj.position;
					wdnPlayer.duration = obj.duration;
				},
				
				getCurrentPosition : function() {
					return currentPosition;
				},
				
				onStateChange : function(event) {
					var wdnPlayer = WDN.jQuery('#' + event.id).parent().data('wdn_player');
					if (!wdnPlayer.played && event.newstate == 'PLAYING') {
						wdnPlayer.played = true;
						WDN.videoPlayer.eventControls.trackEvent(wdnPlayer.src, 'Not HTML5');
						WDN.videoPlayer.eventControls.trackEvent(wdnPlayer.src, 'Play');
					}
					if (event.newstate == 'COMPLETED') {
						WDN.videoPlayer.eventControls.trackEvent(wdnPlayer.src, 'Completed', wdnPlayer.duration);
					}
				},
				
				onFullscreen : function(event) {
					var wdnPlayer = WDN.jQuery('#' + event.id).parent().data('wdn_player');
					if (event.fullscreen == true){
						WDN.videoPlayer.eventControls.trackEvent(wdnPlayer.src, 'Fullscreen');
					}
				},
				
				onClose : function(event) {
					var wdnPlayer = WDN.jQuery(event.data.video).parent().data('wdn_player');
					if (wdnPlayer.played) { //only if the video has played
						WDN.videoPlayer.eventControls.trackEvent(wdnPlayer.src, 'Stopped', wdnPlayer.position);
					}
				},
				
				metaListener : function(meta){
					var wdnPlayer = WDN.jQuery('#' + event.id).parent().data('wdn_player');
					if (meta.width != undefined) {
						wdnPlayer.width = meta.width;
						wdnPlayer.height = meta.height;
					}
				}
			};
		}(),
		
		setupControls : function(){
			return {
				
				initialize : function(video) { //setup custom HTML5 video player

					video.preload = "auto";
					video.autobuffer = true;
					video.controls = false; //remove the standard browser controls
					video.isVideo = true; //autohide custom controls when video is played
					if (video.constructor == HTMLVideoElement) { //if video
						WDN.jQuery(video).after(WDN.videoPlayer.setupControls.wdnVideo_Controls);
						WDN.videoPlayer.setupControls.positionControls(video);
					} else { //if audio
						video.isVideo = false; //do not autohide controls for audio player
						WDN.jQuery(video).after(WDN.videoPlayer.setupControls.wdnAudio_Controls);
					}
					
					WDN.jQuery(video).data('wdn_player', {
						played: false,
						timeouts: {
							progress: null,
							controls: null
						}
					});
				}, 
			
				//setup the HTML to house the controls
				wdnVideo_Controls : 
					  '<div class="wdnVideo_controls">' +
					  '<button class="play_pause play" value="paused" type="button">' +
					  '	<span></span>' +
					  '</button>' +
					  '<div class="progress">' +
					  '	<button class="fullscreen" value="no" type="button"></button>'+
					  '	<ul class="volume">'+
					  '		<li class="on"></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>'+
					  '	</ul>'+
					  '	<span class="time">00:00</span>'+
					  '	<div class="progressBar"><span></span></div>'+
					  '</div>',
				
				wdnAudio_Controls : 
					  '<div class="wdnVideo_controls" style="bottom:5px;">' +
					  '<button class="play_pause play" value="paused" type="button">' +
					  '	<span></span>' +
					  '</button>' +
					  '<div class="progress">' +
					  '	<ul class="volume">'+
					  '		<li class="on"></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>'+
					  '	</ul>'+
					  '	<span class="time">00:00</span>'+
					  '	<div class="progressBar"><span></span></div>'+
					  '</div>',
				
				positionControls : function(video) { //place the controls relative and over the video (for video only, not audio)
						var progressWidth = WDN.jQuery(video).width() - 110;
						var progressBarWidth = progressWidth - 85 - WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').children('.time').outerWidth(true);
						WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').css('width', progressWidth+'px').children('.progressBar').css('width', progressBarWidth+'px');
				}
			};
		}(),
		
		eventControls : function() {
			var playProgressInterval;
			var hideControls;
			var videoHasBeenPlayed;
			
			return {
				
				bindControls : function(video) {
					var wdnPlayer = WDN.jQuery(video).data('wdn_player');
					//clicking the video
					WDN.jQuery(video).click(function(){
						WDN.videoPlayer.eventControls.togglePlay(this);
					});
				
					//play and pause
					WDN.jQuery(video).siblings('.wdnVideo_controls').children('.play').click(function(){
						WDN.videoPlayer.eventControls.togglePlay(video);
						return false;
					});
					
					//video scrub
					WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').children('.progressBar').bind({
						'mousedown': function(event){
							if (video.paused || video.ended) {
					          var videoWasPlaying = false;
					        } else {
					          var videoWasPlaying = true;
					          video.pause();
					        }
	
							document.body.focus();
							WDN.jQuery(document).bind({
								'selectstart.wdnvideo': function () { return false; },
								'mousemove.wdnvideo': function(e){
									WDN.videoPlayer.eventControls.scrubVideo(e.pageX, video);
								},
								'mouseup.wdnvideo': function() {
									WDN.jQuery(document).unbind('.wdnvideo');
									if (videoWasPlaying) {
										video.play();
									}
								}
							});
						},
						'mouseup': function(event){
							WDN.videoPlayer.eventControls.scrubVideo(event.pageX, video);
						}
					});
					//fullscreen controls
					var videoIsFullScreen = false;
					WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').children('.fullscreen').click(function(){
						if (!videoIsFullScreen) {
							WDN.videoPlayer.eventControls.fullScreenOn(video);
							videoIsFullScreen = true;
						} else {
							WDN.videoPlayer.eventControls.fullScreenOff(video);
							videoIsFullScreen = false;
						}
					});
					
					//volume control
					video.volume = .75;
					WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').children('.volume').children('li').eq(-2).prevAll('li').addClass('on');
					
					WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').children('.volume').children('li').click(function(){
						volume = (WDN.jQuery(this).index() / 8);
						video.volume = volume;
						WDN.jQuery(this).prevAll('li').andSelf().addClass('on');
						WDN.jQuery(this).nextAll('li').removeClass('on');
					});
					
					//show and hide the video controls
					if (video.isVideo) {
						WDN.jQuery(video).hover(
							function() {
								var showTimedHide = function() {
									if (wdnPlayer.timeouts.controls) {
										clearTimeout(wdnPlayer.timeouts.controls);
									};
									
									WDN.videoPlayer.eventControls.showControls(video);
									if (!video.paused) {
										wdnPlayer.timeouts.controls = setTimeout(function() {
											WDN.videoPlayer.eventControls.hideControls(video);
										}, 1900);
									}
								};
								
								showTimedHide();
								WDN.jQuery(video).bind('mousemove.wdnvideo', showTimedHide);
							},
							function() {
								WDN.jQuery(video).unbind('.wdnvideo');
								if (wdnPlayer.timeouts.controls) {
									clearTimeout(wdnPlayer.timeouts.controls);
								}
								if (!video.paused) {
									wdnPlayer.timeouts.controls = setTimeout(function() {
										WDN.videoPlayer.eventControls.hideControls(video);
									}, 600); //wait a few seconds and then hide the controls
								}
							}
						);
						WDN.jQuery(video).siblings('.wdnVideo_controls').hover(function(){
								if (wdnPlayer.timeouts.controls) {
									clearTimeout(wdnPlayer.timeouts.controls);
								};
								
								WDN.videoPlayer.eventControls.showControls(video);
						}, function() {
							if (wdnPlayer.timeouts.controls) {
								clearTimeout(wdnPlayer.timeouts.controls);
							}
							if (!video.paused) {
								wdnPlayer.timeouts.controls = setTimeout(function() {
									WDN.videoPlayer.eventControls.hideControls(video);
								}, 600); //wait a few seconds and then hide the controls
							}
						});
					}
					WDN.videoPlayer.eventControls.eventListeners(video);
				},
				
				//Listen for events
				eventListeners : function (video) {
					WDN.jQuery(video).bind({
						'play':         WDN.videoPlayer.eventControls.onPlay,
						'pause':        WDN.videoPlayer.eventControls.onPause,
						'ended':        WDN.videoPlayer.eventControls.onEnd,
//						'error':        WDN.videoPlayer.eventControls.onError,
						'volumechange': WDN.videoPlayer.eventControls.onVolumeChange
					});
					WDN.jQuery(window).bind('unload', {video: video}, WDN.videoPlayer.eventControls.onClose);
				},
				
				togglePlay : function(video) {
					if (video.paused) {
						if (!video.isVideo){ //show the audio controls
							WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').show('fast');
							WDN.jQuery(video).siblings('.title').hide();
						}
						video.play();
					} else {
						if (!video.isVideo) { //hide the audio controls
							WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').hide('fast');
							WDN.jQuery(video).siblings('.title').show();
						}
						video.pause();
					}
				},
				
				onPlay : function(event) {
					var video = event.target;
					var wdnPlayer = WDN.jQuery(video).data('wdn_player');
					WDN.jQuery(video).siblings('.wdnVideo_controls').children('.play_pause').attr('value', 'playing').removeClass('play').addClass('pause');
					WDN.videoPlayer.eventControls.trackPlayProgress(video);
					if (wdnPlayer.timeouts.controls) {
						wdnPlayer.timeouts.controls = setTimeout(function() {
							WDN.videoPlayer.eventControls.hideControls(video);
						}, 1900);
					}
					if (!wdnPlayer.played) {
						WDN.videoPlayer.eventControls.trackEvent(video, 'HTML5');
						WDN.videoPlayer.eventControls.trackEvent(video, 'Play');
						wdnPlayer.played = true;
					}
				},
				
				onPause : function(event) {
					var video = event.target;
					WDN.jQuery(video).siblings('.wdnVideo_controls').children('.play_pause').attr('value', 'paused').removeClass('pause').addClass('play');
					WDN.videoPlayer.eventControls.stopTrackPlayProgress(video);
					WDN.log("We just paused "+video.src);
				},
				
				onEnd : function(event) {
					var video = event.target;
					video.pause();
					WDN.videoPlayer.eventControls.trackEvent(video, 'Completed', video.duration);
				},
				
				onVolumeChange : function(event){
					var video = event.target;
					WDN.log("volume change");
				},
				
				onError : function(event) { // See: http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html#error-codes
					var video = event.target;
					WDN.log("Rats, after all of this and we get an error playing the video.");
					WDN.jQuery(video).siblings('.wdnVideo_controls').remove();
					WDN.videoPlayer.createFallback.setupJWPlayer(video); // fallback to the Flash option
				},
				
				trackPlayProgress : function(video) {
					playProgressInterval = setInterval(function() {
							WDN.videoPlayer.eventControls.updatePlayProgress(video);
					}, 30);
				},
				
				stopTrackPlayProgress : function(video) {
					clearInterval(playProgressInterval);
				},
				
				updatePlayProgress : function(video) { //update time and progress bar
					WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').children('.time').html(WDN.videoPlayer.eventControls.formatTime(video.currentTime)).siblings('.progressBar').children('span').css('width', (video.currentTime / video.duration)*100+'%');
				},
				
				scrubVideo : function (clickX, video){ //clickX is X location of the user's click
					var progressBarLocation = WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').children('.progressBar').offset();
					var progressBarWidth = WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').children('.progressBar').width();
					var newPercent = Math.max(0, Math.min(1, (clickX - progressBarLocation.left) / progressBarWidth));
					video.currentTime = newPercent * video.duration;
					WDN.videoPlayer.eventControls.updatePlayProgress(video);
				},
				
				formatTime : function(seconds) {
					var seconds = Math.round(seconds);
					var minutes = Math.floor(seconds / 60);
					minutes = (minutes >= 10) ? minutes : "0" + minutes;
					seconds = Math.floor(seconds % 60);
					seconds = (seconds >= 10) ? seconds : "0" + seconds;
					return minutes + ":" + seconds;
				},
				
				fullScreenOn : function(video) {
					WDN.jQuery(video).addClass('fullscreen');
					WDN.videoPlayer.setupControls.positionControls(video);
					WDN.jQuery(video).siblings('.wdnVideo_controls').hide();
					WDN.jQuery('body').append("<div id='videoBlackout'></div>");
					WDN.jQuery('body').css({'overflow':'hidden'});
					WDN.jQuery(document).bind('keyup.wdnvideoFS', function(e) {
						if (e.keyCode == 27) {
							e.preventDefault();
							WDN.jQuery(video).siblings('.wdnVideo_controls').children('.progress').children('.fullscreen').click();
						}
					});
					WDN.jQuery(window).bind('resize.wdnvideoFS', function(e) {
						WDN.videoPlayer.setupControls.positionControls(video);
					});
					WDN.videoPlayer.eventControls.showControls(video);
					WDN.videoPlayer.eventControls.trackEvent(video, 'Fullscreen');
				},
				
				fullScreenOff : function(video) {
					WDN.jQuery(video).removeClass('fullscreen');
					WDN.videoPlayer.setupControls.positionControls(video);
					WDN.jQuery(video).siblings('.wdnVideo_controls').hide();
					WDN.jQuery('#videoBlackout').remove();
					WDN.jQuery('body').css({'overflow':'visible'});
					WDN.jQuery(document).unbind('.wdnvideoFS');
					WDN.jQuery(window).unbind('.wdnvideoFS');
					WDN.videoPlayer.eventControls.showControls(video);
				},
				
				showControls: function(video) {
					var ctls = WDN.jQuery(video).siblings('.wdnVideo_controls');
					ctls.stop(true);
					var opc = ctls.css('opacity');
					var time = (1 - opc / 0.8) * 400;
					ctls.fadeTo(time, 0.8);
				},
				
				hideControls : function(video) {
					var ctls = WDN.jQuery(video).siblings('.wdnVideo_controls');
					ctls.stop(true);
					var opc = ctls.css('opacity');
					var time = (opc / 0.8) * 400;
					ctls.fadeTo(time, 0.0);
				},
				
				onClose : function(event) {
					var video = event.data.video;
					var wdnPlayer = WDN.jQuery(video).data('wdn_player');
					if (wdnPlayer.played) { // only if the video has been played
						WDN.videoPlayer.eventControls.trackEvent(video, 'Stopped', video.currentTime);
					}
				},
				
				trackEvent : function(video, eventType, eventValue) {
					var src = video;
					if (typeof video == "object") {
						src = video.src || WDN.jQuery(video).children('source').attr('src');
					}
					if (WDN.analytics) {
						WDN.analytics.callTrackEvent('Video', eventType, src, eventValue);
					}
				}
			};
		}()
	};
}();