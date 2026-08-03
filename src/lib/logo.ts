/**
 * The logo is imported rather than referenced by URL on purpose.
 * next/image leaves a plain string src untouched when images are unoptimized,
 * so a base path deploy would ask for /larvae.png at the domain
 * root and get a 404. A static import goes through the asset pipeline, which
 * applies the base path for us.
 */
import logo from '../../public/larvae.png'

export default logo
