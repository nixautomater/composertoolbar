import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'mmn_custom_composer_toolbar',
  initialize(c) {
    const ss = c.lookup('site-settings:main');
    if (!ss.enable_mmn_custom_composer_toolbar) { return; }

    withPluginApi('0.1', a => {
      a.modifyClass('component:d-editor', {
        actions: {
          toggleMmnPopup(button) {
            const popupName   = `${button.id}-popup`;
            const popupClass  = `.${popupName}`;
            const popup       = $(popupClass);

            if (popup.length > 0) {
              popup.toggleClass('hidden');
            } else {
              let self  = this;
              let pop   = $('<div>', {'class': popupName + ' mmn-popup-menu'});
              let list  = $('<ul>');

              ['theta', 'phi'].forEach(function(key) {
                let btn   = $('<li>').append($('<button>', {
                  html: `<span class="d-button-label">&${key};</span>`,
                  'class': 'btn',
                  title: key,
                  click: function() {
                    self.buttonClicked(button, key);
                  }
                }));
                list.append(btn);
              });

              pop.append(list);
              $('#reply-control').append(pop);
              pop.attr('style', this.popupPosition(button.id));
            }
          },
          applyFormula(button) {
            this._applyFormula(button);
          }
        },
        buttonClicked(button, text) {
          this._applyFormula(button, text);
          $(`.${button.id}-popup`).addClass('hidden');
        },
        _applyFormula(button, text) {
          const sel       = this._getSelected();
          const $textarea = $('textarea.d-editor-input');


          const tx        = (text || button.title);

          const insert    = `${sel.pre}$\\${tx}$`;
          const value     = `${insert}${sel.post}`;

          console.log(insert.length);

          this.set('value', value);
          $textarea.val(value);

          Ember.run.scheduleOnce("afterRender", () => {
            $textarea.prop("selectionStart", insert.length);
            $textarea.prop("selectionEnd", insert.length);
            $textarea.focus();
          });
        },
        popupPosition(button_id) {
          const bottom    = $('#reply-control .wmd-controls').height() + $('#reply-control .submit-panel').height() + 15;
          const btn       = $('.' + button_id);
          const popup     = $('.' + button_id + '-popup');
          const left      = (btn.offset().left + (btn.outerWidth() / 2)) - (popup.outerWidth() / 2);
          return `left:${left}px;bottom:${bottom}px`;
        },
        didDestroyElement() {
          $('.mmn-popup-menu').remove();
        }
      });

      a.onToolbarCreate(t => {

        t.addButton({
          trimLeading: true,
          id: 'mmn-cct-dropdown',
          group: 'extras',
          label: 'composer.mmn_cct_dropdown_label',
          title: 'composer.mmn_cct_dropdown_title',
          action: 'toggleMmnPopup'
        });

        t.addButton({
          trimLeading: true,
          id: 'mmn-cct-btn-html',
          group: 'extras',
          label: 'composer.mmn_cct_btn_html.label',
          title: 'composer.mmn_cct_btn_html.title',
          action: 'applyFormula'
        });

        t.addButton({
          trimLeading: true,
          id: 'mmn-cct-btn-img',
          group: 'extras',
          label: 'composer.mmn_cct_btn_img.label',
          title: 'composer.mmn_cct_btn_img.title',
          action: 'applyFormula'
        });

      });

    });
  }
}