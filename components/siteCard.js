function siteCard(type, domain, host, port, id) {
  
  let site = `<tr>`
  site += `<td><input class="form-check-input m-0 align-middle" name="select${id}" value="${domain}" type="checkbox" aria-label="Select invoice"></td>`
  site += `<td><span class="text-muted">${id}</span></td>`
  site += `<td><a href="https://${domain}" class="text-reset" tabindex="-1" target="_blank">${domain}</a></td>`
  site += `<td>${type}</td>`
  site += `<td>${host}</td>`
  site += `<td>${port}</td>`
  site += `<td><span class="badge bg-success me-1"></span> Enabled</td>`
  site += `<td><span class="badge bg-success me-1"></span> Enabled</td>`
  site += `<td class="text-end"><a class="btn" href="#"> Edit </a></td>`
  site += `</tr>`

  return site;
}

module.exports = { siteCard };