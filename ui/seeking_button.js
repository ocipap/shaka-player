/*! @license
 * Shaka Player
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('shaka.ui.SeekingButton');

goog.require('shaka.ui.Element');
goog.require('shaka.util.Timer');
goog.require('shaka.ui.Enums');
goog.require('shaka.util.Dom');

goog.requireType('shaka.ui.Controls');

/**
 * @extends {shaka.ui.Element}
 * @final
 * @export
 */
shaka.ui.SeekingButton = class extends shaka.ui.Element {
  /**
   * @param {!HTMLElement} parent
   * @param {!shaka.ui.Controls} controls
   * @param {{
   * step: number,
   * icon: keyof shaka.ui.Enums.MaterialDesignIcons
   * }} config
   */
  constructor(parent, controls, config) {
    super(parent, controls);

    /** @private {?boolean} */
    this.triggeredTouchValid_ = false;

    /**
     * @private {{
     * step: number,
     * icon: keyof shaka.ui.Enums.MaterialDesignIcons
     * }}
     */
    this.config = config;

    /**
     * This timer will be used to seeking button on video Container.
     * When the timer ticks it will force button to be invisible.
     *
     * @private {shaka.util.Timer}
     */
    this.hideSeekingButtonOnControlContainerTimer_ = new shaka.util.Timer(
        () => {
          this.hideSeekingButtonOnControlsContainer();
        });


    /** @private {!HTMLElement} */
    this.seekingContainer_ = shaka.util.Dom.createHTMLElement('div');
    this.seekingContainer_.classList
        .add('shaka-fast-foward-on-controls-container');
    this.parent.appendChild(this.seekingContainer_);

    this.eventManager.listen(
        this.seekingContainer_, 'touchstart', (event) => {
          // prevent the default changes that browser triggers
          event.preventDefault();
          // incase any settings menu are open this assigns the first touch
          // to close the menu.
          if (this.controls.anySettingsMenusAreOpen()) {
            this.controls.hideSettingsMenus();
          } else {
            this.onSeekingButtonClick_();
          }
        });

    /** @private {!number} */
    this.seekingTime_ = 0;

    /** @private {!HTMLElement} */
    this.seekingTextElement_ = shaka.util.Dom.createHTMLElement('span');
    this.seekingTextElement_.textContent = '';
    this.seekingContainer_.appendChild(this.seekingTextElement_);

    /** @private {!HTMLElement} */
    this.seekingIcon_ = shaka.util.Dom.createHTMLElement('span');
    this.seekingIcon_.classList
        .add('shaka-seeking-on-controls-container-icon');
    this.seekingIcon_.textContent =
        shaka.ui.Enums.MaterialDesignIcons[config.icon];
    this.seekingContainer_.appendChild(this.seekingIcon_);
  }

  /**
   * This callback is for detecting a double tap or more continuos
   * taps and seeking the video forward as per the number of taps
   * @private
   */
  onSeekingButtonClick_() {
    // The first tap causes the element to become visible. Subsequent taps seek.
    if (!this.triggeredTouchValid_) {
      this.triggeredTouchValid_ = true;
      this.hideSeekingButtonOnControlContainerTimer_.tickAfter(1);
    }
    // stops hidding of fast-forward button incase the timmer is active
    // because of previous touch event.
    this.seekingTime_ += this.config_.step;
    this.seekingTextElement_.textContent = `${this.seekingTime_}s`;
    this.seekingContainer_.style.opacity = '1';
    this.hideSeekingButtonOnControlContainerTimer_.tickAfter(1);
  }

  /**
   * called when the fast forward button needs to be hidden
   */
  hideSeekingButtonOnControlsContainer() {
    // prevent adding seek value if its a single tap.
    if (this.seekingTime_ !== 0) {
      this.video.currentTime =
        this.controls.getDisplayTime() + this.seekingTime_;
    }
    this.seekingTime_ = 0;
    this.triggeredTouchValid_ = false;
    this.seekingContainer_.style.opacity = '0';
    this.seekingTextElement_.textContent = '';
  }
};
