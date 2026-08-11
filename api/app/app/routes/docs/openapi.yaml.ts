import { createRoute } from 'honox/factory'
import openApiSpec from '../../../docs/openapi.yaml?raw'

export const GET = createRoute((c) =>
  c.text(openApiSpec, 200, { 'Content-Type': 'application/yaml' }),
)
