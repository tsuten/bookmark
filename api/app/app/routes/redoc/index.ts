import { createRoute } from 'honox/factory'

const OPENAPI_SPEC_URL = '/docs/openapi.yaml'

export const GET = createRoute((c) =>
  c.html(`<!DOCTYPE html>
<html>
  <head>
    <title>Bookmark API</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
  </head>
  <body>
    <redoc spec-url="${OPENAPI_SPEC_URL}"></redoc>
    <script src="https://cdn.redoc.ly/redoc/v2.4.0/bundles/redoc.standalone.js"></script>
  </body>
</html>`),
)
