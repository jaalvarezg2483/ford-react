import forms from './forms.mjs'
import calculator from './calculator.mjs'
import citas from './citas.mjs'
import places from './places.mjs'
import content from './content.mjs'

/** Reglas de metadatos de los módulos, en orden de prioridad. */
export default [...forms, ...calculator, ...citas, ...places, ...content]
