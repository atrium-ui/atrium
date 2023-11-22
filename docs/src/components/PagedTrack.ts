import { Track } from '@sv/elements/track';
import { css, html } from 'lit';

class PagedTrack extends Track {
  prev() {
    const x = Math.max(this.position.x - (this.offsetWidth - 10), 0);
    this.setTarget([x, 0]);
  }
  next() {
    const x = Math.min(this.position.x + (this.offsetWidth - 10), this.overflowWidth);
    this.setTarget([x, 0]);
  }

  render() {
    return html`
      ${super.render()}

      <div class="arrow arrow-prev" @click=${(e) => this.prev()}>&lt;</div>
      <div class="arrow arrow-next" @click=${(e) => this.next()}>></div>
    `;
  }

  static get styles() {
    return css`
      ${Track.styles}

      .cell {
        overflow: hidden;
        width: 200px;
        height: 200px;
        box-shadow: inset 0 0 0 2px white;
        border-radius: 4px;
        padding: 4px;
        flex: none;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #eaeaea;
      }

      .arrow {
        position: absolute;
        border-radius: 50%;
        background: #ffffff;
        border: 1px solid #eee;
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;

        &.arrow-next {
          right: 15px;
        }

        &.arrow-prev {
          left: 15px;
        }
      }
    `;
  }
}

customElements.define('a-track-paged', PagedTrack);
