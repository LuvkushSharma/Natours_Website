const stripe = Stripe('pk_test_51NlwmdSJ0J4T5F4cCi5BR6gPnkW2gN33yHZBMzhCXkXHoOx7OAgjMbkOG005KIIB5z4KFEnpF7TWnQTtY6rPgngJ00gYRT4sP6');


// Tour id is coming right from the interface.
const bookTour = async (tourId) => {

    try {

        // 1) Get checkout session from API
        const session = await axios(
          `/api/v1/bookings/checkout-session/${tourId}`
        );

        
        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
          sessionId: session.data.session.id
        });

      } catch (err) {


        showAlert('error', err);

      }
}

const bookBtn = document.getElementById('book-tour');

if (bookBtn) {

    bookBtn.addEventListener('click' , e => {

        e.target.textContent = 'Processing...'

        const tourId = e.target.dataset.tourId;
        
        bookTour(tourId);
    
    });
    
  }