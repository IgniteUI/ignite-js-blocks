(function () {
    const baseUrl = $('body').data('base-url');
    const versionsJson = $('body').data('api-versions-json');

    $.ajax({
        url: versionsJson,
        type: "get",
        contentType: 'application/json',
        xhrFields: {
            withCredentials: false
        }
    }).done((data) =>  {
        let folders = data.folders;
        const select = $('#versions');
        const lastVersion = folders.slice(-1)[0];

        folders = folders.reverse();
        folders.forEach(f => {
            select.append($('<option>', {
                value: `${baseUrl}/angular-docs/${f}/sass`,
                text: f
            }));
        });

        select.val(`${baseUrl}/angular-docs/${lastVersion}/sass`);

        if (sessionStorage.apiVersion) {
            select.val(sessionStorage.apiVersion);
        }
    });

    $('#versions').on('change', (...rest) => {
        const val = $('#versions').val();
        sessionStorage.apiVersion = val;
        window.location.assign(val);
    });
})();
