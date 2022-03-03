export namespace ServerHtml {
  export const loginResponseToError = (html: string): string => {
    /* Example output:

    <script type="text/javascript">
      BindAjaxLoader(); HideLoading;
    </script>
    <script type="text/javascript">
      HideLoading();
    </script>
    <div id="feedback_9589" class="row">
    <div class="col-md-12 general-alert short-alert">
    <div class="alert alert-danger "><button type="button" class="close" data-dismiss="alert">×</button>Login failed. Please check your username and password and try again.</div>
    </div>
    </div>
    */

    const match = html.match(new RegExp("</button>(.*?)</div>", "i"));
    if (!match) {
      return "";
    }
    return match[1];
  };
}
