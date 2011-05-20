WDN.navigation = function() {
    var expandedHeight = 0;
    return {

        preferredState : 0,

        currentState : -1,

        /**
         * URL determined to be this site's homepage
         */
        siteHomepage : false,

        /**
         * DOM element for the "HOME" LI
         */
        homepageLI : false,

        /**
         * Stores an expand/collapse timeout.
         */
        timeout : false,

        /**
         * The delay before expand occurs
         */
        expandDelay : 400,

        /**
         * The delay before collapse occurs
         */
        collapseDelay : 120,

        changeSiteNavDelay : 400,

        /**
         * Initialize the navigation, and determine what the correct state
         * should be (expanded/collapsed).
         * @todo determine what it should be
         */
        initialize : function() {
        	if (WDN.jQuery('body').hasClass('popup')
                || WDN.jQuery('body').hasClass('document')
                || WDN.jQuery('#breadcrumbs ul li').size() == 0) {
                // This page has no navigation
                return;
            }
        	WDN.log('let us fix the presentation');
        	WDN.navigation.fixPresentation();
            if (WDN.jQuery('#navigation-close').length > 0) {
                // Already initialized
                return;
            }

            /*
            WDN.jQuery('#navigation').append('<div id="navigation-close"></div>');
            WDN.jQuery('#navigation').append('<div id="navigation-expand-collapse"><span></span></div>');
            WDN.jQuery('#navigation-expand-collapse').click(WDN.navigation.setPreferredState);
            WDN.jQuery('#navigation-close').click(function(evt) {
                if (WDN.navigation.preferredState == 1) {
                    WDN.navigation.setPreferredState(evt);
                }
                WDN.navigation.collapse();
            });
            WDN.navigation.determineSelectedBreadcrumb();
            WDN.navigation.linkSiteTitle();
			*/
            // Store the current state of the cookie
            if (WDN.getCookie('n') == 1) {
                WDN.navigation.preferredState = 1;
            }
        },
        
        setupInteraction : function() {
            WDN.loadJS('wdn/templates_3.0/scripts/plugins/hoverIntent/jQuery.hoverIntent.js', function() {
                /*WDN.jQuery('#breadcrumbs ul li a').hoverIntent({
                    over:        WDN.navigation.switchSiteNavigation,
                    out:         function(){},
                    timeout:     WDN.navigation.changeSiteNavDelay,
                    sensitivity: 1, // Mouse must not move
                    interval:    120
                });
                */
                WDN.jQuery('#navigation:not(.flag) > ul').addClass('nav_collapsed').hoverIntent({
                    over:        WDN.navigation.showFullNavigation,
                    out:         WDN.navigation.hideFullNavigation,
                    timeout:     WDN.navigation.changeSiteNavDelay,
                    sensitivity: 1, // Mouse must not move
                    interval:    120
                });
                WDN.jQuery('#navigation.flag > ul > li').addClass('nav_collapsed').hoverIntent({
                    over:        function() {WDN.navigation.showSingleNavigation(this);},
                    out:         function() {WDN.navigation.hideSingleNavigation(this);},
                    timeout:     WDN.navigation.changeSiteNavDelay,
                    sensitivity: 1, // Mouse must not move
                    interval:    70
                });
                //WDN.navigation.initializePreferredState();
            });

            WDN.log('interactions setup');
        },
        
        /**
         * This function cleans up the navigation visual presentations
         */
        fixPresentation : function(){
        	secondaries = WDN.jQuery('#navigation > ul > li').has('ul');
        	if (secondaries.length > 0){
        		WDN.jQuery("#navigation > ul > li").not(':has(ul)').each(function(){
            		WDN.jQuery(this).append('<ul><li></li></ul>');
            	});
        	}
        		
        	primaries = WDN.jQuery('#navigation > ul > li').length;
        	while (primaries < 6) {
        		WDN.jQuery('#navigation > ul').append('<li class="empty"><a href="#"></a><ul><li></li></ul></li>');
        		primaries++;
        	}
        	
        	ah = 0;
            WDN.jQuery('#navigation > ul > li > a').each(function(){
                if(WDN.jQuery(this).height() > ah) {
                    ah = WDN.jQuery(this).height();
                }
            });
            
            WDN.jQuery('#navigation > ul > li > a').each(function(){
                if(WDN.jQuery(this).height() < ah) {
                	new_ah = (ah - WDN.jQuery(this).height())/2;
                	console.log(new_ah);
                	WDN.jQuery(this).css({'padding':new_ah+'px 0'});
                }
            });
            
        	if (WDN.jQuery('#navigation').hasClass('flag')){ // Needs rewriting once megabox v. flag is decided.
        		WDN.log('we have flag navigation');
        		WDN.jQuery('#navigation ul li ul').each(function(){
                    WDN.jQuery(this).bind(
                    		'webkitTransitionEnd transitionend oTransitionEnd', 
                    		function(event) {
                    			if(WDN.jQuery(this).parent('li').hasClass('nav_collapsed')){
                    				
                    			} else {
                    			   WDN.jQuery(this).parent('li').addClass('nav_pinned').removeClass('nav_changing');
                    			}
                    		},
                    		false
                    ).css({'height':WDN.jQuery(this).height()+'px'});
            	});
        	} else {
        		ul_h = 0;
	        	WDN.jQuery('#navigation ul li ul').each(function(){
	                WDN.jQuery(this).bind(
	                		'webkitTransitionEnd transitionend oTransitionEnd', 
	                		function(event) {
	                			if(WDN.jQuery(this).parents('ul').hasClass('nav_collapsed')){
	                				
	                			} else {
	                			   WDN.jQuery(this).parents('ul').addClass('nav_pinned').removeClass('nav_changing');
	                			}
	                		},
	                		false
	                );
	                
	        		if(WDN.jQuery(this).height() > ul_h) {
	        			ul_h = WDN.jQuery(this).height();
	        		}
	        	});
	        	//loop through again and apply new height
	        	WDN.jQuery('#navigation ul li ul').each(function(){
	        	    WDN.jQuery(this).css({'height':ul_h+'px'});
	            });
        	}
        	
        	WDN.log('we have fixed the presentation. Now to setup the interactions.');
        	WDN.navigation.setupInteraction();
        },
        
        /**
         * This function will bring open the MEGABOX navigation
         */
        
        showFullNavigation : function(){
        	WDN.jQuery('#navigation > ul').addClass('nav_changing').removeClass('nav_collapsed');
        	//WDN.jQuery('#maincontent').fadeTo(0, 0.2);
        },
        
        /**
         * This function will close the MEGABOX navigation
         */
        
        hideFullNavigation : function(){
        	WDN.jQuery('#navigation > ul').addClass('nav_collapsed').removeClass('nav_pinned');
        	//WDN.jQuery('#maincontent').fadeTo(0, 1);
        },
        

        /**
         * This function will bring open the FLAG navigation
         */
        
        showSingleNavigation : function(el){
        	WDN.jQuery(el).addClass('nav_changing').removeClass('nav_collapsed');
        },
        
        /**
         * This function will close the FLAG navigation
         */
        
        hideSingleNavigation : function(el){
        	WDN.jQuery(el).addClass('nav_collapsed').removeClass('nav_pinned');
        },
        /**
         * This function should determine which breadcrumb should be selected.
         */
        determineSelectedBreadcrumb : function() {
            // First we search for a defined homepage.

            if (WDN.jQuery('link[rel=home]').length) {
                WDN.navigation.siteHomepage = WDN.toAbs(WDN.jQuery('link[rel=home]').attr('href'), window.location.toString());
                WDN.log('Setting homepage to '+WDN.navigation.siteHomepage);
            }

            if (WDN.navigation.siteHomepage === false) {
                WDN.log('No homepage set!');
                // Right now, stupidly select the second element.
                WDN.navigation.setHomepageLI(WDN.jQuery('#breadcrumbs > ul >  li:nth-child(2)'));
            } else {
                WDN.log('Homepage has been set.');
                // Make all the hrefs absolute.
                WDN.jQuery('#breadcrumbs > ul > li > a').each(
                        function() {
                            if (this.href == WDN.navigation.siteHomepage) {
                                WDN.navigation.setHomepageLI(WDN.jQuery(this).parent());
                                return false;
                            }
                        }
                    );
                if (WDN.jQuery('#breadcrumbs > ul > li.selected').size() < 1) {
                    WDN.log('We are on the current homepage.');
                    WDN.navigation.setHomepageLI(WDN.jQuery('#breadcrumbs > ul > li:last-child'));
                }
            }
        },

        setHomepageLI: function(li)
        {
            WDN.navigation.homepageLI = li;
            WDN.jQuery(li).addClass('selected');
            if (WDN.jQuery(li).children('a').size()) {
                // Found the homepage url in the breadcrumbs
                WDN.navigation.siteHomepage = WDN.jQuery(li).find('a').attr('href');
            } else {
                // Assume it's the current page
                WDN.navigation.siteHomepage = window.location;
                WDN.jQuery(li).wrapInner('<a href="'+WDN.navigation.siteHomepage+'"></a>');
            }
        },

        /**
         * This function will check for/add a link to the homepage in the site title.
         */

        linkSiteTitle: function() {
            // check if the link already exists
            if (WDN.jQuery("#titlegraphic h1 a").length > 0) {
                return;
            }
            // create the link using whatever the Homepage is set to
            WDN.jQuery("#titlegraphic h1").wrapInner('<a href="' + WDN.navigation.siteHomepage +'" />');
        },

        /**
         * Expand the navigation section.
         */
        expand : function() {
            WDN.log('expand called');
            WDN.jQuery('#navigation-close').show();
            WDN.navigation.setWrapperClass('expanded');
            WDN.navigation.currentState = 1;
            WDN.navigation.updateHelperText();
            //WDN.jQuery('#navigation ul > li:nth-child(6) a:visible:first').css('width','86%');
        },

        updateHelperText : function() {
            if (WDN.navigation.preferredState == 1) {
                WDN.jQuery('#navigation-expand-collapse span').text('click to always hide full navigation');
            } else {
                if (WDN.navigation.currentState === 0) {
                    WDN.jQuery('#navigation-expand-collapse span').text('roll over for full navigation');
                } else {
                    WDN.jQuery('#navigation-expand-collapse span').text('click to always show full navigation');
                }
            }
        },

        /**
         * Collapse the navigation
         */
        collapse : function(animate) {
            WDN.log('collapse called');
            if (WDN.navigation.currentState === 0) {
                return;
            }
            if (expandedHeight === 0) {
                //expandedHeight = WDN.jQuery('#navigation').height();
            }
            //WDN.jQuery('#navigation-close').hide();
            //WDN.jQuery('#navigation-expand-collapse span').text('roll over for full navigation');
            //WDN.jQuery('#navigation ul:first li:nth-child(6) a:visible:first').css('width','100%');
            WDN.navigation.setWrapperClass('collapsed');
            WDN.navigation.currentState = 0;
            WDN.navigation.switchSiteNavigation(WDN.jQuery(WDN.navigation.homepageLI).children('a:first-child'), false);
        },

        /**
         * Set a delay for collapsing the navigation.
         */
        startCollapseDelay: function(event) {
            WDN.log('start collapse delay');
            clearTimeout(WDN.navigation.timeout);
            if (WDN.navigation.currentState === 0
                || WDN.navigation.preferredState == 1) {
                // Already collapsed, or, prefer to stay open
                return;
            }
            WDN.navigation.timeout = setTimeout(WDN.navigation.collapse, WDN.navigation.collapseDelay);
        },

        setPreferredState : function(event) {
            WDN.log('set preferred state');
            if (WDN.getCookie('n')!=1) {
                WDN.log('Setting preferred navigation state OPEN');

                WDN.setCookie('n',1,1209600);
                WDN.navigation.preferredState = 1;
                WDN.analytics.trackNavigationPreferredState("Open");
            } else {
                WDN.log('Setting preferred navigation state CLOSED');
                WDN.setCookie('n',0,-100);
                WDN.navigation.preferredState = 0;
                WDN.analytics.trackNavigationPreferredState("Closed");
            }
            WDN.navigation.initializePreferredState();
        },

        /**
         * This function determines the user's preference for navigation.
         * There are two options, expanded or collapsed.
         */
        initializePreferredState : function() {
            WDN.log('initializepreferredstate, current state is '+WDN.navigation.currentState);
            var mouseout = WDN.jQuery.noop;
            if (WDN.navigation.preferredState==1) {
                WDN.navigation.setWrapperClass('pinned');
                WDN.navigation.expand();
            } else {
                WDN.navigation.collapse();
                mouseout = WDN.navigation.startCollapseDelay;
            }

            WDN.jQuery('#wdn_navigation_bar').hoverIntent({
                over:        WDN.navigation.expand,
                out:         mouseout,
                timeout:     WDN.navigation.expandDelay,
                sensitivity: 1, // Mouse must not move
                interval:    120
            });
            WDN.jQuery('#wdn_content_wrapper,#header').hover(
                    WDN.navigation.startCollapseDelay);
            WDN.navigation.updateHelperText();
        },

        switchSiteNavigation : function(event, expand) {
            WDN.log('Switch site nav called');
            if (expand === undefined) {
                expand = true;
            }
            var breadcrumb = (event.target)?event.target:event;
            if (WDN.jQuery(breadcrumb).parent().hasClass('selected')) {
                WDN.log('already showing this nav');
                return true;
            }

            var height = WDN.jQuery('#navigation ul').height() || 50;
            var oldSelected = WDN.jQuery('#breadcrumbs > ul > li.selected:first');

            if (!WDN.jQuery('div.storednav', oldSelected).length && WDN.jQuery('#navigation > ul').length) {
                WDN.log('Storing it');
                // Store the current navigation
                WDN.navigation.storeNav(oldSelected, WDN.jQuery('#navigation > ul'));
            } else {
                WDN.jQuery('#navigation > ul').remove();
            }

            // Set the hovered breadcrumb link to selected
            oldSelected.removeClass('selected');
            WDN.jQuery(breadcrumb).parent().addClass('selected');
            // Check for stored navigation
            if (WDN.jQuery(breadcrumb).siblings('div.storednav').length) {
                WDN.log("Already got it.");
                // We've already grabbed the nav for this link
                WDN.navigation.setNavigationContents(WDN.jQuery(breadcrumb).siblings('div.storednav').children().clone(), expand);
                return true;
            }

            WDN.jQuery('#navloading').remove();
            WDN.jQuery('#navigation').append('<div id="navloading" style="height:'+height+'px;"></div>');

            var nav_sniffer = 'http://www1.unl.edu/wdn/templates_3.0/scripts/navigationSniffer.php?u=';
            nav_sniffer = nav_sniffer+escape(WDN.toAbs(breadcrumb.href, window.location));
            WDN.log('Attempting to retrieve navigation from '+nav_sniffer);
            WDN.get(nav_sniffer, '', function(data, textStatus) {
                try {
                    if (textStatus == 'success') {
                        var breadcrumbParent = WDN.jQuery(breadcrumb).parent();
                        WDN.navigation.storeNav(breadcrumbParent, data);
                        if (breadcrumbParent.hasClass('selected')) {
                            WDN.navigation.setNavigationContents(data, expand);
                        }
                    } else {
                        // Error message
                        WDN.log('Incorrect status code returned remotely retrieving navigation.');
                        WDN.log(data);
                        WDN.log(textStatus);
                    }
                } catch(e) {
                    WDN.log('Caught error remotely retrieving navigation.');
                    WDN.log(e);
                }
            });
            return false;
        },

        setNavigationContents : function(contents, expand) {
            WDN.log('setNavigationContents called');
            WDN.jQuery('#navloading').remove();
            WDN.jQuery('#navigation').children('ul').remove()
                .end().prepend(contents);
            if (!expand) {
                return;
            }
            WDN.navigation.currentState = -1;
            WDN.navigation.expand();
        },

        setWrapperClass : function(css_class) {
            WDN.log('Adding class '+css_class);
            if (css_class=='collapsed') {
                WDN.jQuery('#navigation > ul').removeClass('nav_pinned').addClass('nav_'+css_class);
                return;
            }

            WDN.jQuery('#navigation > ul').removeClass('nav_collapsed').addClass('nav_'+css_class);
        },

        storeNav : function(li, data) {
            var storednavDiv = WDN.jQuery(li).children('div.storednav');
            if (storednavDiv.length) {
                storednavDiv.empty();
            } else {
                storednavDiv = WDN.jQuery('<div class="storednav"/>');
                WDN.jQuery(li).append(storednavDiv);
            }
            storednavDiv.append(data);
        }
    };
}();