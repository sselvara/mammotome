import { createDomStructure, getProductDB, translate } from '../../scripts/lib-franklin.js';

function getInfo() {
  const url = new URL(window.location);
  return { language: url.pathname.substring(1, url.pathname.indexOf('/', 1)) };
}

function getProduct(json, productCode, language) {
  const product = json.Product.data
    .find((entry) => entry.ProductCodes.split('|').includes(productCode)
      && entry.Languages.split('|').map((lang) => lang.toUpperCase()).includes(language.toUpperCase()));

  if (product) {
    const translation = json.ProductTranslation.data
      .find((entry) => entry.ProductRef === product.ProductCodes && entry.Language === language);

    product.Name = translation?.Name || product.Name;
    product.Image = translation?.Image || product.Image;
  }

  return product;
}

async function createButtons(productCode) {
  return [
    [
      await translate('productReferenceInformationURL', '../contact/'),
      ['primary'],
      await translate('productReferenceInformation', 'Request Information'),
    ],
    [
      await translate('productReferenceSupportURL', '../product-support'),
      ['secondary'],
      await translate('productReferenceSupport', 'Product Support'),
    ],
    [
      `${await translate('productReferenceSupportURL', '../product-support')}/${productCode}`,
      ['secondary'],
      await translate('productReferenceDocuments', 'Product Documents'),
    ],
  ].map(([href, className, textContent]) => ({ href, className, textContent }));
}

export default async function decorate(block) {
  const productCode = block.querySelector('div > div')?.textContent?.trim();

  block.innerHTML = '';

  if (!productCode) {
    return;
  }

  const { language } = getInfo();
  const json = await getProductDB();
  const product = getProduct(json, productCode, language);

  if (!product) {
    return;
  }

  const buttons = await createButtons(product.ProductCodes.split('|')[0]);

  const imgStructure = [
    {
      type: 'img',
      attributes: { src: product.Image },
    },
  ];

  const buttonStructure = buttons.map(({ href, className, textContent }) => ({
    type: 'a',
    attributes: { href },
    children: [{ type: 'button', classes: [className], textContent }],
  }));

  createDomStructure([
    {
      type: 'div',
      children: [
        imgStructure,
        buttonStructure,
      ].map((children) => (
        {
          type: 'div',
          classes: ['product-ref-container'],
          children: [
            {
              type: 'div',
              children,
            },
          ],
        })),
    },
  ], block);
}
