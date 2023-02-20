/*! @license
 * Shaka Player
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('shaka.ui.HiddenFastForwardButton');

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
shaka.ui.HiddenFastForwardButton = class extends shaka.ui.Element {
  /**
   * @param {!HTMLElement} parent
   * @param {!shaka.ui.Controls} controls
   */
  constructor(parent, controls) {
    super(parent, controls);

    /** @private {?boolean} */
    this.triggeredTouchValid_ = false;

    /**
     * This timer will be used to hide fast forward button on video Container.
     * When the timer ticks it will force button to be invisible.
     *
     * @private {shaka.util.Timer}
     */
    this.hideFastForwardButtonOnControlsContainerTimer_ = new shaka.util.Timer(
        () => {
          this.hideFastForwardButtonOnControlsContainer();
        });


    /** @private {!HTMLElement} */
    this.fastforwardContainer_ = shaka.util.Dom.createHTMLElement('div');
    this.fastforwardContainer_.classList
        .add('shaka-fast-foward-on-controls-container');
    this.parent.appendChild(this.fastforwardContainer_);

    this.eventManager.listen(
        this.fastforwardContainer_, 'touchstart', (event) => {
          // prevent the default changes that browser triggers
          event.preventDefault();
          // incase any settings menu are open this assigns the first touch
          // to close the menu.
          if (this.controls.anySettingsMenusAreOpen()) {
            this.controls.hideSettingsMenus();
          } else {
            this.onFastForwardButtonClick_();
          }
        });

    /** @private {!HTMLElement} */
    this.fastForwardValue_ = shaka.util.Dom.createHTMLElement('span');
    this.fastForwardValue_.textContent = '0s';
    this.fastforwardContainer_.appendChild(this.fastForwardValue_);

    /** @private {!HTMLElement} */
    this.fastforwardIcon_ = shaka.util.Dom.createHTMLElement('span');
    this.fastforwardIcon_.classList
        .add('shaka-seeking-on-controls-container-icon');
    this.fastforwardIcon_.textContent =
        shaka.ui.Enums.MaterialDesignIcons.FAST_FORWARD;
    this.fastforwardContainer_.appendChild(this.fastforwardIcon_);
  }

  /**
   * This callback is for detecting a double tap or more continuos
   * taps and seeking the video forward as per the number of taps
   * @private
   */
  onFastForwardButtonClick_() {
    // The first tap causes the element to become visible. Subsequent taps seek.
    if (!this.triggeredTouchValid_) {
      this.triggeredTouchValid_ = true;
      this.hideFastForwardButtonOnControlsContainerTimer_.tickAfter(1);
    }
    // stops hidding of fast-forward button incase the timmer is active
    // because of previous touch event.
    this.fastForwardValue_.textContent =
        `+${(parseInt(this.fastForwardValue_.textContent, 10) + 5).toString()}s`;
    this.fastforwardContainer_.style.opacity = '1';
    this.hideFastForwardButtonOnControlsContainerTimer_.tickAfter(1);
  }

  /**
   * called when the fast forward button needs to be hidden
   */
  hideFastForwardButtonOnControlsContainer() {
    // prevent adding seek value if its a single tap.
    if (parseInt(this.fastForwardValue_.textContent, 10) !== 0) {
      this.video.currentTime = this.controls.getDisplayTime() + parseInt(
          this.fastForwardValue_.textContent, 10);
    }
    this.fastforwardContainer_.style.opacity = '0';
    this.triggeredTouchValid_ = false;
    this.fastForwardValue_.textContent = '0s';
  }
};
