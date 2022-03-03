import {
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
} from "@material-ui/core";
import { useState } from "react";
import { server } from "../config";
import Router from "next/router";

function DeletePopup({ _id, setLoading }) {
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("id", _id);
    const response = await fetch(`${server}/api/posts/?${params}`, {
      method: "DELETE",
    });

    if (response.ok) {
      Router.reload();
    } else {
      setLoading(false);
      console.error(await response.json());
    }
  }

  return (
    <>
      <Button
        size="small"
        color="secondary"
        variant="outlined"
        disableElevation
        onClick={() => setOpen(true)}
        style={{ marginLeft: "auto" }}
      >
        Delete
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Delete this image?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deleting this image is irreversible. You will not be able to undo
            this action in the future.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Keep
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              handleDelete();
            }}
            color="secondary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeletePopup;
