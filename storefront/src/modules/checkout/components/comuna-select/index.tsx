import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"
import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"

/**
 * Lista estática de comunas / sectores que maneja la app.
 * Se usa internamente; no hace falta pasarla como prop.
 */
type Commune = { code: string; name: string }

const COMMUNES: Commune[] = [
  { code: "yobilo",           name: "Yobilo" },
  { code: "amanecer",         name: "Amanecer" },
  { code: "villa-mora",       name: "Villa Mora" },
  { code: "berta",            name: "Berta" },
  { code: "la-pena",          name: "La Peña" },
  { code: "salvador-allende", name: "Salvador Allende" },
  { code: "lagunillas",       name: "Lagunillas" },
  { code: "cerro-obligado",   name: "Cerro Obligado" },
  { code: "lo-rojas",         name: "Lo Rojas" },
  { code: "laurie",           name: "Laurie" },
  { code: "coronel-centro",   name: "Coronel Centro" },
  { code: "galilea",          name: "Galilea" },
  { code: "pocuro-escuadron", name: "Pocuro Escuadrón" },
  { code: "corcovado",        name: "Corcovado" },
  { code: "la-mora",          name: "La Mora" },
  { code: "bicentenario",     name: "Bicentenario" },
]

/**
 * Select para elegir comuna.
 *
 * Si no se pasa `communes`, usa la lista estática `COMMUNES`.
 */
const CommuneSelect = forwardRef<
  HTMLSelectElement,
  NativeSelectProps & { communes?: Commune[] }
>(({ placeholder = "Comuna", communes = COMMUNES, defaultValue, ...props }, ref) => {
  const innerRef = useRef<HTMLSelectElement>(null)

  useImperativeHandle(ref, () => innerRef.current)

  const options = useMemo(
    () =>
      communes.map(({ code, name }) => ({
        value: code,
        label: name,
      })),
    [communes],
  )

  return (
    <NativeSelect
      ref={innerRef}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...props}
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </NativeSelect>
  )
})

CommuneSelect.displayName = "CommuneSelect"

export default CommuneSelect
