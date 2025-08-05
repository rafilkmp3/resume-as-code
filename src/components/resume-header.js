class ResumeHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* Add your component styles here */
      </style>
      <header>
        <h1>${this.getAttribute('name')}</h1>
        <p>${this.getAttribute('label')}</p>
      </header>
    `;
  }
}

customElements.define('resume-header', ResumeHeader);
