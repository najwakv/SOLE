/* eslint-disable no-dupe-else-if */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */


        async function addtoCart(productId) {
            // window.alert("one"+productId)
            
            $.ajax({
                url: `/addToCart/${productId}`,
                data: {
                    name: productId,
                },
                method: "post",
                success: (response) => {
                    if (response.added) {
                        //   $("#cart").load(location.href + " #cart>*", "");
                        
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: " Added ",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    }
                    else if (response.loginerr) {
                        // window.location = "/signin";
                        
                        Swal.fire({
                            position: "center",
                            icon: "error",
                            title: "please login first",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    
                    } else if (response.added) {
                        $("#productCard").load(location.href + " #productCard>*", "");
                       
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "Item added to cart",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    } else if (response.exist) {
                        $("#productCard").load(location.href + " #productCard>*", "");
                        Swal.fire({
                            position: "right-end",
                            icon: "success",
                            title: " already exist",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    }
                }
            })
        }

   
        async function addtoWishlist(productId) {
            // window.alert("one")
            $.ajax({
                url: `/addToWishlist/${productId}`,
                data: {
                    name: productId,
                },
                method: "post",
                success: (response) => {
                    if (response.added) {
                        //   $("#cart").load(location.href + " #cart>*", "");
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: " Added ",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    }
                    else if (response.loginerr) {
                        // window.location = "/signin";
                        Swal.fire({
                            position: "center",
                            icon: "error",
                            title: "please login first",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    } else if (response.added) {
                        $("#productCard").load(location.href + " #productCard>*", "");
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "Item added to cart",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    } else if (response.exist) {
                        $("#productCard").load(location.href + " #productCard>*", "");
                        Swal.fire({
                            position: "right-end",
                            icon: "success",
                            title: " already exist",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    }
                }
            })
        }

        async function removeFromCart(productId) {
            // window.alert("one")
            $.ajax({
                url: `/removeFromCart`,
                data: {
                 id :  productId
                },
                method: "post",
                success: (response) => {
                    if (response.deleted) {
                        //   $("#cart").load(location.href + " #cart>*", "");
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: " Added ",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    }
                    else if (response.loginerr) {
                        // window.location = "/signin";
                        Swal.fire({
                            position: "center",
                            icon: "error",
                            title: "please login first",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    } else if (response.added) {
                        // $("#productCard").load(location.href + " #productCard>*", "");
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "Item added to cart",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    } else if (response.exist) {
                        // $("#productCard").load(location.href + " #productCard>*", "");
                        Swal.fire({
                            position: "right-end",
                            icon: "success",
                            title: " already exist",
                            customClass: "swal-wide",
                            showConfirmButton: false,
                            timer: 1000,
                        });
                    }else if (response.delete) {
                        // $("#cart").load(location.href + " #cart>*", "");
                     
                        // Swal.fire({
                        //     position: "center",
                        //     icon: "success",
                        //     title: " Item deleted",
                        //     customClass: "swal-wide",
                        //     showConfirmButton: true,
                        //     timer: 500,
                        // });
                    }
                }
            })
        }
